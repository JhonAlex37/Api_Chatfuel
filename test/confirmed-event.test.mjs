import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmedCalendarOwner } from '../src/calendar/confirmedEvent.js';

const row={bitrixEventId:'123',bitrixUserId:'16106',startAt:'2026-11-06T21:50:00Z',endAt:'2026-11-06T22:00:00Z',
  response:{marker:'CHATFUEL_APPOINTMENT:test',crmSync:{dealId:'777'}}};
const event={ID:'123',CAL_TYPE:'user',OWNER_ID:'16106',DELETED:'N',DESCRIPTION:row.response.marker,
  DATE_FROM:'06/11/2026 16:50:00',DATE_TO:'06/11/2026 17:00:00',TZ_FROM:'America/Bogota',TZ_TO:'America/Bogota',
  DATE_FROM_TS_UTC:'1793991000',UF_CRM_CAL_EVENT:['D_777']};
const advisors=[{bitrixUserId:'16106'},{bitrixUserId:'19922'}];

test('verifica el horario local y su zona sin confiar en el timestamp desplazado de Bitrix',()=>{
  assert.equal(confirmedCalendarOwner(row,event,advisors),'16106');
});
test('un cambio de hora, propietario o vínculo requiere revisión',()=>{
  for(const patch of [{DATE_FROM:'06/11/2026 15:50:00'},{OWNER_ID:'19922'},{UF_CRM_CAL_EVENT:['D_999']}]) {
    assert.throws(()=>confirmedCalendarOwner(row,{...event,...patch},advisors),error=>error.reviewRequired===true);
  }
});
