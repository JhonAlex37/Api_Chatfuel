export function readConfig(env = process.env) {
  if (!env.MYSQL_URL) throw new Error('Falta MYSQL_URL.');
  const databaseUrl = new URL(env.MYSQL_URL);
  if (databaseUrl.protocol !== 'mysql:') throw new Error('MYSQL_URL debe usar mysql://.');
  if (!env.BITRIX_WEBHOOK_URL) throw new Error('Falta BITRIX_WEBHOOK_URL.');
  const bitrix = new URL(env.BITRIX_WEBHOOK_URL);
  if (bitrix.protocol !== 'https:' || !/^\/rest\/\d+\/[^/]+\/?$/.test(bitrix.pathname)
      || bitrix.search || bitrix.hash || bitrix.username || bitrix.password) {
    throw new Error('BITRIX_WEBHOOK_URL debe ser https://portal/rest/usuario/webhook/.');
  }
  const port = Number(env.PORT || 3000);
  const calendar = new URL(env.BITRIX_CALENDAR_WEBHOOK_URL || bitrix.href);
  if (calendar.protocol !== 'https:' || calendar.host !== bitrix.host
    || !/^\/rest\/\d+\/[^/]+\/?$/.test(calendar.pathname) || calendar.search || calendar.hash
    || calendar.username || calendar.password) throw new Error('Webhook de calendario Bitrix inválido.');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválido.');
  return {
    port,
    mysqlUrl: env.MYSQL_URL,
    bitrixUrl: bitrix.href.replace(/\/?$/, '/'),
    calendarUrl: calendar.href.replace(/\/?$/, '/'),
    webhookToken: env.REGISTRAR_CLIENTE_TOKEN || '',
  };
}
