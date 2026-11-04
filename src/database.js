import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';

export const schemaUrl = new URL('../sql/001_clientes.sql', import.meta.url);

export function createDatabase(uri) {
  const pool = mysql.createPool({
    uri, connectionLimit: 5, waitForConnections: true, queueLimit: 100,
    connectTimeout: 10000, enableKeepAlive: true, charset: 'utf8mb4',
    supportBigNumbers: true, bigNumberStrings: true, timezone: 'Z',
  });
  return {
    async init() { await pool.query(await readFile(schemaUrl, 'utf8')); },
    async ping() { await pool.query({ sql: 'SELECT 1', timeout: 5000 }); },
    async saveCliente(cliente) {
      await pool.execute(`
        INSERT INTO clientes (id_negociacion, id_contacto, nombres, apellidos, nombre_completo, telefono)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE id_contacto = ?, nombres = ?, apellidos = ?,
          nombre_completo = ?, telefono = ?, actualizado_en = CURRENT_TIMESTAMP(3)
      `, [cliente.id_negociacion, cliente.id_contacto, cliente.nombres, cliente.apellidos,
        cliente.nombre_completo, cliente.telefono, cliente.id_contacto, cliente.nombres,
        cliente.apellidos, cliente.nombre_completo, cliente.telefono]);
    },
    async close() { await pool.end(); },
  };
}
