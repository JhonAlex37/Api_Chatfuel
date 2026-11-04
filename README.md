# API Chatfuel

Registra en MySQL los datos del contacto principal de una negociación de Bitrix24.

## Endpoint

`GET /registrar-cliente?id=32135`

También admite `POST` con el mismo parámetro en la URL. En el robot de Bitrix, reemplaza `32135` por el ID dinámico de la negociación usando el selector de campos:

```text
https://apichatfuel-production.up.railway.app/registrar-cliente?id=32135
```

La API consulta `crm.deal.get`, obtiene el contacto principal con `crm.deal.contact.items.get` y lee sus datos con `crm.contact.get`. El webhook entrante debe tener permiso CRM y acceso de lectura a las negociaciones y contactos. Referencia: [API oficial de Bitrix24](https://apidocs.bitrix24.com/api-reference/crm/deals/contacts/crm-deal-contact-items-get.html).

La tabla `clientes` guarda `id_negociacion` (clave única), `id_contacto`, `nombres`, `apellidos`, `nombre_completo`, `telefono`, `creado_en` y `actualizado_en`. Los reintentos actualizan la misma fila. El teléfono se conserva como texto; se prefiere móvil, luego trabajo y luego el primer teléfono disponible. Si no tiene teléfono, se guarda `NULL` y se devuelve una advertencia. Si no existe contacto o nombre, responde 422 sin guardar.

Respuesta 200:

```json
{"ok":true,"id_negociacion":"32135","mensaje":"Cliente registrado o actualizado correctamente."}
```

La respuesta no expone nombres ni teléfonos. Errores: 400 ID inválido; 401 token incorrecto cuando está configurado; 404 negociación inexistente; 422 contacto incompleto; 502 error de Bitrix; 504 timeout de Bitrix; 503 error de MySQL. Solo se confirma el registro después de guardar. `/health` comprueba la conexión MySQL.

## Configuración

Requiere Node.js 22.9+ (recomendado 24) y MySQL 8. Crea una base vacía `chatfuel` y configura `.env` a partir de `.env.example`. Nunca subas credenciales al repositorio.

```sh
npm ci
npm run db:init
npm start
```

La tabla se crea automáticamente al arrancar; `db:init` permite crearla por separado. El esquema está en `sql/001_clientes.sql`.

En Railway:

1. Servicio MySQL con `MYSQL_DATABASE=chatfuel` y volumen persistente.
2. En el servicio de la API, `MYSQL_URL=${{MySQL.MYSQL_URL}}`.
3. Configura `BITRIX_WEBHOOK_URL=https://tu-portal/rest/usuario/webhook/`.
4. Opcionalmente configura `REGISTRAR_CLIENTE_TOKEN` y envíalo desde Bitrix por `X-Webhook-Token` o `&token=...`. Sin esta variable, el endpoint acepta la URL solicitada sin token.
5. Despliega el repositorio de esta API; `railway.json` configura inicio y healthcheck.

Al preparar este proyecto, el dominio indicado estaba conectado a `JhonAlex37/Api_Chatfuel`, mientras este repositorio es `Proyecta-SAS/Api_Chatfuel`. Hay que resolver esa diferencia antes de publicar; crear estos archivos localmente no modifica el código que atiende el dominio.

## Pruebas

```sh
npm test
```

Para incluir la prueba real de persistencia, define `TEST_MYSQL_URL` con un servidor MySQL/MariaDB de prueba y un usuario con permiso de crear bases. La prueba crea una base temporal con nombre aleatorio y elimina únicamente esa base al terminar. No usa Bitrix real ni inserta clientes reales.
