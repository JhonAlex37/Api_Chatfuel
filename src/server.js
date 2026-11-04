import { readConfig } from './config.js';
import { createDatabase } from './database.js';
import { createBitrixClient } from './bitrix.js';
import { createApp } from './app.js';
import { createHandler, startHandoffListener } from './connector.mjs';

let database;
let stopBookingListener;
try {
  const config = readConfig();
  database = createDatabase(config.mysqlUrl);
  await database.init();
  const bookingHandler = createHandler();
  const server = createApp({ database, bitrix: createBitrixClient(config.bitrixUrl), webhookToken: config.webhookToken, bookingHandler });
  server.listen(config.port, '0.0.0.0', () => console.log(`API escuchando en puerto ${config.port}`));
  server.on('error', () => { console.error('No se pudo iniciar el servidor HTTP.'); process.exit(1); });
  if (process.env.HANDOFF_SYNC_ENABLED === 'true') stopBookingListener = startHandoffListener(bookingHandler);
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    stopBookingListener?.();
    const deadline = setTimeout(() => process.exit(1), 15000);
    deadline.unref();
    server.close(async () => { await database.close(); clearTimeout(deadline); });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} catch {
  console.error('No se pudo iniciar la API. Verifica MYSQL_URL, BITRIX_WEBHOOK_URL y el acceso a MySQL.');
  stopBookingListener?.();
  if (database) await database.close();
  process.exitCode = 1;
}
