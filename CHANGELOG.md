# V1.0.5 - 2026-11-05

- Reintenta hasta tres veces las consultas seguras ante fallos temporales, con un máximo de ocho segundos por consulta.
- Captura también los errores asíncronos del perfilamiento y de la consulta de horarios.
- Distingue una consulta fallida de una reserva que requiere verificación y conserva los datos para retomar.
- Mantiene la confirmación explícita, las claves de idempotencia y la protección ante reservas inciertas.
- Registra causas técnicas acotadas sin credenciales ni datos del cliente.

# V1.0.4 - 2026-11-05

- Busca en MySQL el teléfono antes de reservar y vincula su negociación al evento de calendario.
- Solicita `C370:EXECUTING` solo después de confirmar la cita; sin registro conserva el flujo anterior.
- Normaliza teléfonos colombianos y pide revisión si existen varias negociaciones para el mismo número.
- Fija el vínculo en los reintentos y conserva citas confirmadas si queda pendiente el cambio de etapa.
- Mantiene la recuperación de mensajes incorporada en V1.0.3.

# V1.0.1

- Ofrece horarios libres más separados dentro de la franja seleccionada.
- Integra la agenda y el registro de clientes en `Api_Chatfuel`.
- Conserva MySQL como servicio separado y mantiene `/registrar-cliente`.

# Historial de cambios

## 1.0.0 - 2026-11-04

- Endpoint GET/POST `/registrar-cliente?id=...` para registrar clientes desde Bitrix24.
- Consulta de negociación y contacto principal: nombres, apellidos y teléfono.
- Persistencia en MySQL con creación automática de la tabla `clientes` y actualización sin duplicados por ID de negociación.
- Validación de solicitudes, manejo de errores y token de webhook opcional.
- Configuración de despliegue Railway y verificación de MySQL en `/health`.
- Pruebas de API y persistencia; instrucciones y variables de ejemplo.
