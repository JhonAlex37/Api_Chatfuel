# Api_Chatfuel

Este repositorio contiene exclusivamente la integración Chatfuel / 30X / Bitrix.
Conservar las preguntas y el scoring del motor original de DalIA cuando se
trabaje en este proyecto. Los cambios futuros de Chatfuel se realizan aquí.

- Leer README.md y docs/MIGRACION.md antes de cambiar el despliegue.
- Ejecutar `npm run check`, `npm test` y `git diff --check` al cambiar el conector.
- La cuenta solicitada por el usuario es su cuenta personal de Jhon Alexander;
  verificar el login activo antes de publicar. Al preparar esta copia, GitHub
  mostró JhonAlex37 y permiso READ sobre el repositorio. Registrar cambios
  locales y comprobar el acceso efectivo antes de intentar publicar.
- Los tokens y datos de clientes se guardan fuera de Git. No copiar .runtime,
  archivos DPAPI, documentos de clientes ni volcados del proyecto anterior.
- Los simuladores no crean negociaciones ni citas. Una reserva real requiere
  elección del cliente y confirmación técnica de Bitrix.
- Al migrar, preparar el servicio nuevo con HANDOFF_SYNC_ENABLED=false y
  coordinar el cambio de URLs y del observador para evitar procesamiento doble.
