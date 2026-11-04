import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

test('MySQL real: esquema, inserción, actualización y concurrencia sin duplicados', { skip: !process.env.TEST_MYSQL_URL }, async () => {
  const mysql = (await import('mysql2/promise')).default;
  const { createDatabase } = await import('../src/database.js');
  const name = `chatfuel_test_${randomBytes(8).toString('hex')}`;
  const uri = new URL(process.env.TEST_MYSQL_URL);
  uri.pathname = '/';
  const admin = await mysql.createConnection(uri.href);
  let database;
  try {
    await admin.query(`CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4`);
    uri.pathname = `/${name}`;
    database = createDatabase(uri.href);
    await database.init();
    await database.init();
    const cliente = { id_negociacion: '32135', id_contacto: '81', nombres: "María D'Ávila", apellidos: '', nombre_completo: "María D'Ávila", telefono: '+57 3001234567' };
    await database.saveCliente(cliente);
    const [before] = await admin.query(`SELECT * FROM \`${name}\`.clientes`);
    assert.equal(before[0].nombre_completo, cliente.nombre_completo);
    assert.equal(before[0].telefono, cliente.telefono);
    await Promise.all(Array.from({ length: 10 }, () => database.saveCliente({ ...cliente, telefono: '+57 3019999999' })));
    const [after] = await admin.query(`SELECT * FROM \`${name}\`.clientes`);
    assert.equal(after.length, 1);
    assert.equal(after[0].telefono, '+57 3019999999');
    assert.equal(after[0].creado_en.getTime(), before[0].creado_en.getTime());
    await database.saveCliente({ ...cliente, telefono: null });
    const [missing] = await admin.query(`SELECT telefono FROM \`${name}\`.clientes`);
    assert.equal(missing[0].telefono, null);
  } finally {
    if (database) await database.close();
    await admin.query(`DROP DATABASE IF EXISTS \`${name}\``);
    await admin.end();
  }
});
