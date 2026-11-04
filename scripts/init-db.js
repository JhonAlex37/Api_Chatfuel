import { createDatabase } from '../src/database.js';

if (!process.env.MYSQL_URL) throw new Error('Falta MYSQL_URL.');
const database = createDatabase(process.env.MYSQL_URL);
try {
  await database.init();
  console.log('Tabla clientes creada o verificada.');
} catch {
  console.error('No se pudo crear la tabla clientes. Verifica la conexión y los permisos MySQL.');
  process.exitCode = 1;
} finally {
  await database.close();
}
