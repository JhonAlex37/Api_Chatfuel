# Historial de cambios

## 1.0.0 - 2026-11-04

- Endpoint GET/POST `/registrar-cliente?id=...` para registrar clientes desde Bitrix24.
- Consulta de negociación y contacto principal: nombres, apellidos y teléfono.
- Persistencia en MySQL con creación automática de la tabla `clientes` y actualización sin duplicados por ID de negociación.
- Validación de solicitudes, manejo de errores y token de webhook opcional.
- Configuración de despliegue Railway y verificación de MySQL en `/health`.
- Pruebas de API y persistencia; instrucciones y variables de ejemplo.
