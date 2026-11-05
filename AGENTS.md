# Api_Chatfuel

Este repositorio contiene exclusivamente la integración Chatfuel / 30X / Bitrix.
Conservar las preguntas y el scoring del motor original de DalIA cuando se
trabaje en este proyecto. Los cambios futuros de Chatfuel se realizan aquí.

- Leer README.md y docs/MIGRACION.md antes de cambiar el despliegue.
- Ejecutar `npm run check`, `npm test` y `git diff --check` al cambiar el conector.
- Publicar en `https://github.com/JhonAlex37/Api_Chatfuel`, rama `main`.
  Este es el repositorio conectado a Railway; `Proyecta-SAS/Api_Chatfuel`
  es el origen histórico del fork y no debe confundirse con el destino actual.
  Pueden publicar el propietario `JhonAlex37` y los colaboradores que tengan
  permiso de escritura, incluido `Juan-David-A-C`. Cada persona usa su propia
  cuenta, autoría y credenciales; no exigir a un colaborador que inicie sesión
  como `JhonAlex37` ni que cambie su identidad para poder subir cambios.
  Si un push falla, comprobar el remoto, la cuenta autenticada y el error real
  de GitHub antes de atribuirlo a una falta de permisos. `user.name` y
  `user.email` identifican la autoría del commit; no conceden acceso al remoto.
  Antes de crear commits, comprobar `gh api user --jq .login` y la identidad
  local de Git. Deben corresponder a la persona que publica en esa sesión.
  Si no coinciden, usar `scripts/configurar-autor-github.ps1 -Cuenta LOGIN`
  con la cuenta autenticada del colaborador; nunca atribuirle a otra persona
  los cambios ni reutilizar la identidad del propietario por estar guardada.
  Ver [docs/COLABORADORES.md](docs/COLABORADORES.md).
- Los tokens y datos de clientes se guardan fuera de Git. No copiar .runtime,
  archivos DPAPI, documentos de clientes ni volcados del proyecto anterior.
- Los simuladores no crean negociaciones ni citas. Una reserva real requiere
  elección del cliente y confirmación técnica de Bitrix.
- Al migrar, preparar el servicio nuevo con HANDOFF_SYNC_ENABLED=false y
  coordinar el cambio de URLs y del observador para evitar procesamiento doble.

## Publicaciones

Por preferencia expresa del usuario, escribir los mensajes de commit y las
etiquetas de versión en español, con versión y descripción breve. Formato:
`V1.0.1: Ofrece horarios libres más separados`.
Mantener la secuencia de versiones existente y asociar la etiqueta `Vx.y.z`
a la revisión publicada. No reescribir commits que ya se compartieron.

El usuario fijó expresamente `V1.0.1` para la publicación de horarios separados;
usar esta secuencia en las próximas versiones, en lugar de continuar 2.1.x.
