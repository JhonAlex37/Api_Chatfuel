import { readConfig } from '../src/config.js';
import { createBitrixClient } from '../src/bitrix.js';
import { readAdvisors } from '../src/calendar/service.js';
import { bogotaToday, addCalendarDays } from '../src/calendar/appointmentAvailability.js';

// Solo lectura: no crea perfiles, eventos, comentarios ni mensajes.
const config=readConfig();
const advisors=readAdvisors(process.env);
const calendar=createBitrixClient(config.calendarUrl);
const date=bogotaToday();
const payload=await calendar.call('calendar.accessibility.get',{
  from:date,to:addCalendarDays(date,7),users:advisors.map(a=>Number(a.bitrixUserId)),
});
const verified=advisors.filter(a=>Array.isArray(payload?.[a.bitrixUserId]));
if(verified.length!==advisors.length) throw new Error('No se pudo verificar algún calendario configurado.');
console.log(JSON.stringify({ok:true,provider:'bitrix',advisorsVerified:verified.length,readOnly:true}));
