import { readConfig } from './config.js';
import { createDatabase } from './database.js';
import { createBitrixClient } from './bitrix.js';
import { createApp } from './app.js';
import { createHandler, startHandoffListener } from './connector.mjs';
import { createSchedulingService, readAdvisors, startCrmSyncWorker } from './calendar/service.js';

let database;
let stopBookingListener;
let stopCrmSync;
try {
  const config = readConfig();
  database = createDatabase(config.mysqlUrl);
  await database.init();
  const bitrix = createBitrixClient(config.bitrixUrl);
  const calendar = createBitrixClient(config.calendarUrl, { timeoutMs: 2500 });
  const scheduling = createSchedulingService({ database, bitrix, calendar, advisors: readAdvisors(process.env) });
  const bookingHandler = createHandler({ database, scheduling });
  const server = createApp({ database, bitrix, webhookToken: config.webhookToken, bookingHandler });
  server.listen(config.port, '0.0.0.0', () => console.log(`API escuchando en puerto ${config.port}`));
  server.on('error', () => { console.error('No se pudo iniciar el servidor HTTP.'); process.exit(1); });
  if (process.env.HANDOFF_SYNC_ENABLED === 'true') stopBookingListener = startHandoffListener(bookingHandler);
  stopCrmSync = startCrmSyncWorker(scheduling);
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    stopBookingListener?.();
    stopCrmSync?.();
    const deadline = setTimeout(() => process.exit(1), 15000);
    deadline.unref();
    server.close(async () => { await database.close(); clearTimeout(deadline); });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} catch {
  console.error('No se pudo iniciar la API. Verifica MySQL, los webhooks Bitrix y APPOINTMENT_ADVISORS_JSON.');
  stopBookingListener?.();
  stopCrmSync?.();
  if (database) await database.close();
  process.exitCode = 1;
}
