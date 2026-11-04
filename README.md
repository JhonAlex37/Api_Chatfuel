# Api_Chatfuel

Integración independiente de Chatfuel con las negociaciones de **30X** y el
calendario de **Bitrix** para el piloto de reducción de crédito hipotecario.
Repositorio: https://github.com/JhonAlex37/Api_Chatfuel

## Funciones

- Recoge las respuestas guardadas por Chatfuel y crea o actualiza la misma
  negociación al pasar al asesor o iniciar el agendamiento.
- Envía un comentario legible con banco, cobertura, saldo pendiente en pesos,
  tiempo pagando, cuotas vencidas, datos pendientes y motivo de atención.
- Consulta disponibilidad real de Bitrix: franja, dos días y tres horarios.
- Reserva una llamada de diez minutos con confirmación explícita, valida el
  evento creado y controla reintentos y comentarios repetidos.
- Escucha cambios de chats mediante WebSocket y recupera pendientes al conectar.

Versión actual: **2.1.19**. La agenda reconoce un «sí» a la oferta inmediatamente
anterior aunque la extracción de intención de la IA quede pendiente. Los mensajes
de agenda incorporan emojis; la reserva exige elegir y confirmar un horario.
El motor original de DalIA conserva sus preguntas y scoring. El scoring nuevo
de Chatfuel de 0 a 100 sigue pendiente. La reserva real completa por WhatsApp
también está pendiente de verificación.

## Estructura

```text
src/connector.mjs                  Servicio Bun independiente
test/connector.test.mjs            36 pruebas con servicios simulados
config/chatfuel/rch-questions.json Preguntas y captura autorizadas
docs/MIGRACION.md                  Cambio al proyecto nuevo de Railway
Dockerfile                        Imagen de ejecución
docs/RAILWAY.md                   Configuración del servicio independiente
.env.example                      Nombres de variables, sin credenciales
```

## Ejecutar las pruebas

Requiere Node.js 24 o superior. El conector usa las API incluidas del runtime;
las pruebas se ejecutan directamente, sin instalar dependencias externas.

```powershell
npm run check
npm test
```

Para ejecutar el servidor local con Bun, copiar `.env.example` a `.env`,
completar las variables y ejecutar `bun run start`. Con Docker, construir
`docker build -t api-chatfuel .` y ejecutar
`docker run --rm --env-file .env -p 3000:3000 api-chatfuel`.
Las variables completas son necesarias para que `/health` devuelva 200.

Después de construir la imagen, `./scripts/smoke-docker.ps1` comprueba arranque,
salud, previsualización y autenticación usando credenciales ficticias. Detiene
el contenedor de prueba al terminar; no envía mensajes ni crea registros reales.

## Configuración

| Variable | Uso |
| --- | --- |
| `CHATFUEL_BOT_ID` | Bot que se atiende |
| `CHATFUEL_API_TOKEN` | Token del usuario virtual Editor del bot |
| `CHATFUEL_BOOKING_SECRET` | Secreto compartido de al menos 32 caracteres |
| `AI_FIRST_ONE_BASE_URL` | URL HTTPS de la API de 30X |
| `AI_FIRST_ONE_APPOINTMENTS_TOKEN` | Credencial de la API de agenda/negociaciones |
| `CHATFUEL_BOOKING_FLOW_ID` | Flujo de agenda de Chatfuel |
| `APPOINTMENT_SAME_DAY_CUTOFF_HOUR` | Corte para ofrecer el mismo día; 12 por defecto |
| `HANDOFF_SYNC_ENABLED` | Activa el observador cuando vale `true` |
| `PORT` | Puerto HTTP; 3000 por defecto |

Configurar valores propios del servicio nuevo. Las referencias a variables
de otro servicio del proyecto DalIA deben resolverse y reemplazarse por
variables del nuevo proyecto al migrar. La conexión con 30X usa su API HTTPS.

## Endpoints

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/health` | Estado, versión y conexión del observador; sin datos de clientes |
| POST | `/booking` | Inicio o continuación del flujo de calendario |
| POST | `/sync-handoffs` | Revisión de transferencias pendientes |

Los POST requieren `Authorization: Bearer <CHATFUEL_BOOKING_SECRET>`.
`/booking` recibe `contactId` y `operation` (`start` o `step`), y devuelve
`message`, `done`, `human`, `state` y `clientCode`. El flujo guarda la respuesta
en `bitrix_agenda_respuesta` y deriva al equipo cuando `human` es `si`.

## Estado de la separación

El código está publicado con la cuenta **JhonAlex37**, en este repositorio y
su rama `main`. Railway está conectado a ese origen y despliega los cambios
automáticamente. El servicio independiente usa
`https://apichatfuel-production.up.railway.app`.

Las dos acciones HTTP de la agenda de Chatfuel apuntan a ese dominio. El
observador nuevo está activo; el anterior del proyecto DalIA quedó desactivado
como respaldo de reversión. El motor original mantiene su configuración.
Ver [docs/MIGRACION.md](docs/MIGRACION.md) y [docs/RAILWAY.md](docs/RAILWAY.md).

Configuración de despliegue basada en las guías oficiales de
[Bun con Docker](https://bun.com/guides/ecosystem/docker) y
[Railway Config as Code](https://docs.railway.com/config-as-code/reference).

## Configuración de conversación y pruebas

La revisión de tono y el reinicio solicitado por el cliente están versionados
en `config/chatfuel/rch-questions.json`. Su aplicación en Chatfuel es separada
del despliegue de Railway. Ver [docs/PRUEBAS.md](docs/PRUEBAS.md) para iniciar
una nueva revisión y verificar la reserva real en Bitrix.
