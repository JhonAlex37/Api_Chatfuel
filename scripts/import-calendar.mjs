import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Importación única de un respaldo autorizado. El motor no utiliza este archivo
// ni el proyecto de referencia al atender conversaciones o reservar.
export async function importCalendar(connection, snapshot) {
  if (!Array.isArray(snapshot.profiles) || !Array.isArray(snapshot.appointments)) throw new Error('INVALID_SNAPSHOT');
  const seen = new Set();
  for (const profile of snapshot.profiles) {
    if (!/^[\w:-]{1,128}$/.test(profile.codigo) || !/^\d{8,15}$/.test(profile.telefono)
      || seen.has(profile.telefono)) throw new Error('INVALID_OR_DUPLICATE_PROFILE');
    seen.add(profile.telefono);
  }
  let profiles = 0, appointments = 0;
  await connection.beginTransaction();
  try {
    for (const profile of snapshot.profiles) {
      const [existing] = await connection.execute('SELECT codigo,telefono FROM chatfuel_perfiles WHERE codigo=? OR telefono=?', [profile.codigo, profile.telefono]);
      if (existing.length) {
        if (existing.length !== 1 || existing[0].codigo !== profile.codigo || existing[0].telefono !== profile.telefono) throw new Error('PROFILE_CONFLICT');
        continue;
      }
      await connection.execute('INSERT INTO chatfuel_perfiles(codigo,telefono,nombre,conversacion,datos) VALUES(?,?,?,?,?)',
        [profile.codigo, profile.telefono, profile.nombre, profile.conversacion || null, JSON.stringify({ answers:profile.answers || {} })]);
      profiles++;
    }
    for (const row of snapshot.appointments) {
      if (!/^chatfuel-[a-f0-9]{64}$/.test(row.idempotency_key) || !['confirmed','pending','failed','cancelled'].includes(row.status)
        || !Number.isFinite(Date.parse(row.starts_at)) || !Number.isFinite(Date.parse(row.ends_at))
        || Date.parse(row.ends_at) <= Date.parse(row.starts_at)
        || row.status === 'confirmed' && !/^[1-9]\d*$/.test(String(row.bitrix_event_id || ''))) throw new Error('INVALID_APPOINTMENT');
      const [existing] = await connection.execute('SELECT id,cliente_codigo,bitrix_evento_id FROM chatfuel_citas WHERE clave_idempotencia=? OR id=?', [row.idempotency_key,row.id]);
      if(existing.length) {
        if(existing.length!==1 || existing[0].id!==row.id || existing[0].cliente_codigo!==row.client_code
          || existing[0].bitrix_evento_id!==row.bitrix_event_id) throw new Error('APPOINTMENT_CONFLICT');
        continue;
      }
      await connection.execute(`INSERT INTO chatfuel_citas(id,cliente_codigo,asesor_id,bitrix_usuario_id,bitrix_evento_id,
        clave_idempotencia,inicio,fin,estado,solicitud,respuesta,creado_en)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`, [row.id,row.client_code,row.advisor_user_id,row.bitrix_owner_id,row.bitrix_event_id,
        row.idempotency_key,new Date(row.starts_at),new Date(row.ends_at),row.status,JSON.stringify(row.request_payload || {}),
        JSON.stringify({ ...row.response_payload, marker:`DALLIA_APPOINTMENT:${row.id}` }),new Date(row.created_at)]);
      appointments++;
    }
    await connection.commit();
    return { profilesImported:profiles, appointmentsImported:appointments };
  } catch(error) { await connection.rollback();throw error; }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const chunks=[];for await(const chunk of process.stdin) chunks.push(chunk);
  const snapshot=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  const connection=await mysql.createConnection({uri:process.env.MYSQL_URL,timezone:'Z',supportBigNumbers:true,bigNumberStrings:true});
  try {
    const schema=await readFile(new URL('../sql/002_agenda.sql',import.meta.url),'utf8');
    for(const statement of schema.split(';').map(s=>s.trim()).filter(Boolean)) await connection.query(statement);
    console.log(JSON.stringify(await importCalendar(connection,snapshot)));
  } finally { await connection.end(); }
}
