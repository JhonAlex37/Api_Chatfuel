import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../src/connector.mjs';

const CONTACT = 'wa_999999999999_888888888888_573000000099';
const NOW = Date.parse('2026-11-05T15:00:00Z');

function fixture({ enabled = true, external = true, status = 'automated', contact = {}, fields = {},
  message = {}, failTakeover = false, lostAssignmentResponse = false, assignmentCode = null } = {}) {
  const calls = [];
  let taken = false;
  const current = { id: CONTACT, assignee: null, salesStageV2: 'New', unhandledSwitchToHuman: false,
    attributes: Object.entries(fields).map(([name, value]) => ({ attr: { name }, value: { stringValue: value } })), ...contact };
  const latest = { id: 'mensaje-entrante-simulado', __typename: 'WhatsAppInTextMessage',
    sentTime: new Date(NOW - 60_000).toISOString(), ...message };
  const failure = code => Response.json({ errors: [{ extensions: { errors: [{ extensions: { code } }] } }] });
  const fetchImpl = async (url, init) => {
    const payload = JSON.parse(init.body);
    calls.push({ url, payload });
    if (!url.endsWith('/graphql')) throw new Error('La recuperación no debe crear registros ni citas');
    const query = payload.query;
    if (query.includes('query HandoffCandidates')) return Response.json({ data: { bot: { contactChatsConnection: {
      // La búsqueda conserva deliberadamente una fotografía vieja del contacto.
      edges: [{ node: { id: CONTACT, name: 'Prueba', phone: '573000000099', assignee: null,
        salesStageV2: 'New', unhandledSwitchToHuman: false, attributes: [] } }],
      pageInfo: { hasNextPage: false, endCursor: null },
    } } } });
    if (query.includes('query IncomingRecoveryContext')) return Response.json({ data: { bot: {
      contact: current, conversation: { status, messages: { edges: [{ node: latest }] } },
    } } });
    if (query.includes('mutation IncomingRecoveryAssign')) {
      if (lostAssignmentResponse) throw new Error('Respuesta perdida simulada');
      if (assignmentCode) return failure(assignmentCode);
      if (external && !taken) return failure('ConversationThreadOwnedByExternalApp');
      return Response.json({ data: { contactSetFuelyAIAssignee: { id: CONTACT, assignee: { __typename: 'FuelyAIAssignee' } } } });
    }
    if (query.includes('mutation IncomingRecoveryTakeover')) {
      if (failTakeover) return failure('TakeoverFailed');
      taken = true;
      return Response.json({ data: { conversationStart: { id: CONTACT, status: 'open' } } });
    }
    if (query.includes('mutation BookingAttributes')) return Response.json({ data: { a0: { id: CONTACT } } });
    if (query.includes('query HandoffState')) return Response.json({ data: { bot: { conversation: { status: 'automated' } } } });
    throw new Error('Operación inesperada en la prueba de recuperación');
  };
  const handler = createHandler({ scheduling: { request: async () => { throw new Error('No calendar calls expected'); } }, now: () => NOW, fetchImpl, env: {
    CHATFUEL_BOT_ID: 'bot-simulado', CHATFUEL_API_TOKEN: 'token-simulado',
    CHATFUEL_BOOKING_SECRET: 'clave-simulada-de-mas-de-treinta-y-dos-caracteres',
    INCOMING_RECOVERY_ENABLED: String(enabled),
  } });
  const count = operation => calls.filter(call => call.payload.query.includes(operation)).length;
  return { handler, count, calls };
}

test('recupera el control externo y asigna la IA una sola vez para cada mensaje', async () => {
  const f = fixture();
  await f.handler.synchronizeHandoffs();
  await f.handler.synchronizeHandoffs();
  assert.equal(f.count('mutation IncomingRecoveryTakeover'), 1);
  assert.equal(f.count('mutation IncomingRecoveryAssign'), 2); // rechazo externo y asignación tras recuperar
  assert.equal(f.handler.handoffStatus.incomingRecovered, 1);
  assert.equal(f.handler.handoffStatus.incomingRecoveryLastError, null);
  assert.equal(f.count('mutation BookingAttributes'), 1);
});

test('un mensaje sin asignar que ya pertenece a Chatfuel no requiere transferencia', async () => {
  const f = fixture({ external: false });
  await f.handler.synchronizeHandoffs();
  assert.equal(f.count('mutation IncomingRecoveryTakeover'), 0);
  assert.equal(f.count('mutation IncomingRecoveryAssign'), 1);
});

test('respeta atención humana, reservas, mensajes respondidos y la ventana de WhatsApp', async () => {
  for (const options of [
    { status: 'open' }, { status: 'closed' },
    { contact: { unhandledSwitchToHuman: true } },
    { contact: { assignee: { __typename: 'PublicUserAccount' } } },
    { contact: { salesStageV2: 'Ready' } },
    { fields: { bitrix_reserva_pendiente: 'si' } },
    { message: { __typename: 'WhatsAppOutTextMessage' } },
    { message: { sentTime: new Date(NOW - 86_400_000).toISOString() } },
    { message: { sentTime: 'fecha-inválida' } },
  ]) {
    const f = fixture(options);
    await f.handler.synchronizeHandoffs();
    assert.equal(f.count('mutation IncomingRecoveryAssign'), 0, JSON.stringify(options));
    assert.equal(f.count('mutation IncomingRecoveryTakeover'), 0, JSON.stringify(options));
  }
});

test('no interviene cuando la recuperación automática está desactivada', async () => {
  const f = fixture({ enabled: false });
  await f.handler.synchronizeHandoffs();
  assert.equal(f.count('query IncomingRecoveryContext'), 0);
  assert.equal(f.count('mutation IncomingRecoveryAssign'), 0);
});

test('un resultado incierto no repite la respuesta ni intenta tomar control sin el error específico', async () => {
  for (const options of [{ failTakeover: true }, { lostAssignmentResponse: true }, { assignmentCode: 'NotEnoughPermissions' }]) {
    const f = fixture(options);
    await f.handler.synchronizeHandoffs();
    const writes = f.count('mutation IncomingRecoveryAssign');
    await f.handler.synchronizeHandoffs();
    assert.equal(f.count('mutation IncomingRecoveryAssign'), writes);
    assert.equal(f.handler.handoffStatus.incomingRecovered, 0);
    assert.equal(f.handler.handoffStatus.incomingRecoveryLastError, 'INCOMING_RECOVERY_FAILED');
    if (!options.failTakeover) assert.equal(f.count('mutation IncomingRecoveryTakeover'), 0);
  }
});
