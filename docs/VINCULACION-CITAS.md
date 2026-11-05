# V1.0.4: citas vinculadas a clientes MySQL

Antes de enviar la reserva confirmada por el usuario, `/booking` busca el teléfono de WhatsApp en `clientes`. Compara números completos; reconoce móviles colombianos con o sin `57`, espacios, paréntesis y guiones. No utiliza coincidencias por últimos dígitos.

- Una coincidencia: envía `bitrixDealId` y `bitrixStageId: C370:EXECUTING` a la API de citas.
- Ninguna: envía la solicitud anterior sin estos campos; la agenda sigue funcionando.
- Varias negociaciones: solicita revisión humana sin crear la cita.
- MySQL no disponible: permite reintentar, sin tratar el fallo como cliente inexistente.

El vínculo (incluyendo la ausencia de vínculo) queda fijado en el estado firmado al iniciar la reserva. Un reintento no vuelve a buscar otra negociación. Las reservas iniciadas en versiones anteriores conservan el contrato anterior.

## Contrato con 30X

`POST /api/v1/leads/{clientCode}/appointments` admite el par opcional:

```json
{"bitrixDealId":"777","bitrixStageId":"C370:EXECUTING"}
```

30X valida que la negociación pertenezca al embudo 370 antes de crear el evento. Envía `crm_fields: ["D_777"]` a `calendar.event.add`. Solo después de confirmar y guardar la cita ejecuta y verifica el cambio de etapa. El flujo anterior, que no envía el par, conserva su comportamiento y su etapa predeterminada.

Una falla de etapa conserva el evento y registra la sincronización pendiente en la base de 30X. La respuesta al cliente sigue confirmando la cita. Se guardan `bitrix_negociacion_id` y `bitrix_negociacion_sync` (`completado`, `pendiente` o `no_aplica`) en Chatfuel.

Cuando llega otra solicitud `/booking` para un estado confirmado con sincronización pendiente, solo reintenta `POST /api/v1/appointments/retry-crm` con `appointmentId`; no solicita otro evento. 30X también conserva su endpoint de mantenimiento sin ID para procesar pendientes. Si la etapa fue modificada por otra acción, el reintento requiere revisión y no sobrescribe ese cambio.

## Publicación y validación

Publicar primero la extensión compatible de 30X; después esta versión del conector. No activar esta versión contra una API de citas que ignore `bitrixDealId`/`bitrixStageId`.

Pruebas: coincidencia, ausencia, ambigüedad, fallo MySQL, teléfonos equivalentes, reintento con respuesta perdida, evento vinculado al ID exacto, error de calendario, cambio de etapa pendiente y recuperación sin duplicados. Las pruebas no crean citas reales ni envían WhatsApp. El ensayo real debe hacerse con el horario elegido y confirmado por el cliente.
