import { validId } from '../bitrix.js';

function sameTime(value, zone, expected) {
  const text = String(value ?? '');
  if (/^\d{4}-\d\d-\d\dT.*(?:Z|[+-]\d\d:\d\d)$/.test(text)) return Date.parse(text) === Date.parse(expected);
  const local = text.match(/^(\d{2})[/.](\d{2})[/.](\d{4}) (\d{2}):(\d{2})(?::(\d{2}))?$/);
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  const actual = local ? `${local[3]}-${local[2]}-${local[1]} ${local[4]}:${local[5]}:${local[6] || '00'}`
    : iso ? `${iso[1]}-${iso[2]}-${iso[3]} ${iso[4]}:${iso[5]}:${iso[6] || '00'}` : null;
  if (!actual) return false;
  try {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: zone || 'America/Bogota',
      year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit',
      hourCycle:'h23' }).formatToParts(new Date(expected)).map(p => [p.type,p.value]));
    return actual === `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
  } catch { return false; }
}

export function confirmedCalendarOwner(row, event, advisors) {
  const reject = code => { throw Object.assign(new Error(code), { code, reviewRequired:true }); };
  if (!event || String(event.ID) !== String(row.bitrixEventId) || event.CAL_TYPE !== 'user'
    || event.DELETED === 'Y' || event.DT_SKIP_TIME === 'Y') reject('CALENDAR_EVENT_MISMATCH');
  // Bitrix warns that DATE_FROM_TS_UTC includes a server offset: it is not a UTC timestamp.
  if (!sameTime(event.DATE_FROM,event.TZ_FROM,row.startAt)
    || !sameTime(event.DATE_TO,event.TZ_TO || event.TZ_FROM,row.endAt)) reject('CALENDAR_TIME_CHANGED');
  const owner = String(event.OWNER_ID ?? '');
  if (!validId(owner) || !advisors.some(a => String(a.bitrixUserId) === owner)
    || owner !== String(row.bitrixUserId)) reject('CALENDAR_OWNER_CHANGED');
  const marker = row.response?.marker;
  if (!marker || !String(event.DESCRIPTION || event['~DESCRIPTION'] || '').includes(marker)) reject('CALENDAR_EVENT_MISMATCH');
  const links = event.UF_CRM_CAL_EVENT ?? [];
  if (!Array.isArray(links) || links.some(link => link !== `D_${row.response.crmSync.dealId}`)) reject('CALENDAR_DEAL_MISMATCH');
  return owner;
}
