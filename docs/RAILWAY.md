# Railway independiente de Chatfuel

## Servicio activo

- Proyecto: `Api Chatfuel`, ID `a8744968-739a-441f-ab07-eca9488a3830`.
- Servicio: `Api_Chatfuel`, ID `b15812dd-8735-45f3-9e31-086c4862c50b`.
- Entorno: `production`, ID `ac461721-7ee3-4600-9ed6-126a2d8b0d0a`.
- Origen GitHub: `JhonAlex37/Api_Chatfuel`, rama `main`.
- Dominio: https://apichatfuel-production.up.railway.app
- Salud: https://apichatfuel-production.up.railway.app/health

## Construcción y despliegue

Railway detecta el Dockerfile de la raíz y ejecuta Node.js 24. El conector lee `PORT`
y las nueve variables descritas en README.md. Las credenciales de agenda están en el servicio de API. MYSQL_URL conserva
la conexión al servicio MySQL del mismo proyecto, que permanece separado.

La configuración de despliegue está en el propio servicio de Railway:

- Healthcheck: `/health`, tiempo máximo 120 segundos.
- Un observador activo (`HANDOFF_SYNC_ENABLED=true`) y una réplica.
- Desactivado el modo de suspensión del servicio activo.
- Overlap y draining de despliegues: cero segundos.
- El contenedor escucha en el puerto `PORT`, actualmente 3000.

Dockerfile permite la detección de construcción sin archivo `railway.json`.
Las comprobaciones de arranque verifican credenciales configuradas; la conexión
del observador y los errores se consultan en el cuerpo de `/health`.

## Comprobaciones

Antes de publicar: `npm run check`, `npm test` y `git diff --check`.
La prueba local Docker usa `./scripts/smoke-docker.ps1` con valores ficticios.
Las sesiones `cfPreview` se excluyen de escrituras de CRM y reservas.

La prueba real debe comprobar las preguntas, la negociación y comentario en
30X y, con confirmación del cliente, el evento en el calendario de Bitrix.
El scoring nuevo de 0 a 100 sigue pendiente; el scoring original de DalIA
conserva su configuración.

La API unificada arranca `src/server.js` y conserva `/registrar-cliente`.
Las rutas `/booking` y `/sync-handoffs` llegan al mismo conector de agenda.
El servicio API necesita además MYSQL_URL, BITRIX_WEBHOOK_URL y el token
opcional REGISTRAR_CLIENTE_TOKEN que ya usaba el registro. No registrar un
cliente ni completar una fila de MySQL implica iniciar mensajes en WhatsApp.
