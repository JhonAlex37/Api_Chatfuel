# Api_Chatfuel

Este repositorio contiene exclusivamente la integración Chatfuel / 30X / Bitrix.
Conservar las preguntas y el scoring del motor original de DalIA cuando se
trabaje en este proyecto. Los cambios futuros de Chatfuel se realizan aquí.

- Leer README.md y docs/MIGRACION.md antes de cambiar el despliegue.
- Ejecutar `npm run check`, `npm test` y `git diff --check` al cambiar el conector.
- Publicar con la cuenta personal `JhonAlex37` en
  `https://github.com/JhonAlex37/Api_Chatfuel`, rama `main`. La autoría y la
  conexión de Railway a ese origen fueron verificadas. `Proyecta-SAS` es el
  origen histórico del fork; los cambios de Chatfuel se publican en la cuenta
  personal según la instrucción del usuario.
- Los tokens y datos de clientes se guardan fuera de Git. No copiar .runtime,
  archivos DPAPI, documentos de clientes ni volcados del proyecto anterior.
- Los simuladores no crean negociaciones ni citas. Una reserva real requiere
  elección del cliente y confirmación técnica de Bitrix.
- Al migrar, preparar el servicio nuevo con HANDOFF_SYNC_ENABLED=false y
  coordinar el cambio de URLs y del observador para evitar procesamiento doble.

## Publicaciones

Por preferencia expresa del usuario, escribir los mensajes de commit y las
etiquetas de versión en español, con versión y descripción breve. Formato:
`V2.1.19: Corrige la aceptación de llamadas para abrir la agenda de Bitrix`.
Mantener la secuencia de versiones existente y asociar la etiqueta `Vx.y.z`
a la revisión publicada. No reescribir commits que ya se compartieron.
