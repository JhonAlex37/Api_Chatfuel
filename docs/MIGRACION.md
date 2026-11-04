# Migrar Api_Chatfuel a su propio proyecto de Railway

## Punto de partida

El servicio activo `chatfuel-bitrix-booking` está en el proyecto DalIA.
La URL actual es `https://chatfuel-bitrix-booking-production-68a2.up.railway.app`.
Proyecto: `f738779e-2840-495c-b09b-0c2597c814cd`.
Servicio: `ff561cac-0a81-4561-9aa6-661f0bcb537b`.
Entorno: `4a4e8414-0996-48c2-977f-58678ae59d0e`.

El usuario proporciona el proyecto nuevo de Railway. Publicar este repositorio
requiere acceso WRITE y usar la cuenta personal confirmada del usuario.

## Preparación

1. Confirmar la cuenta, subir los archivos y conectar `main` del repositorio
   `Proyecta-SAS/Api_Chatfuel` al proyecto nuevo.
2. Crear el servicio con el Dockerfile de este repositorio. Copiar únicamente
   las variables listadas en `.env.example`; sus valores se transfieren entre
   almacenes de secretos, sin guardarlos en archivos ni imprimirlos.
3. Resolver las referencias a credenciales y corte horario del proyecto anterior
   antes de copiar: las referencias entre servicios pertenecen a cada proyecto.
4. Mantener `HANDOFF_SYNC_ENABLED=false` en el nuevo servicio durante preparación.
5. Generar su dominio, verificar `/health` y ejecutar el recorrido de simulación
   de agenda usando un identificador `cfPreview`, sin registros reales.

## Cambio coordinado

1. Guardar las dos URLs HTTP actuales del flujo de agenda de Chatfuel y el estado
   del observador anterior como información de reversión.
2. Desactivar el observador anterior y verificar que dejó de procesar eventos.
3. Actualizar las acciones HTTP `start` y `step` de Chatfuel a la nueva URL
   `/booking`, conservando el mismo secreto y la estructura del flujo.
4. Activar el observador únicamente en el servicio nuevo y verificar WebSocket
   conectado, ausencia de errores y recuperación de transferencias.
5. Verificar que el perfilamiento se muestra en la misma negociación de 30X.
   Elegir una cita real solo con el cliente y comprobar su evento en Bitrix.
6. Conservar inicialmente el servicio anterior detenido/inactivo para reversión.
   La eliminación definitiva requiere una instrucción específica del usuario.

## Reversión

Desactivar el observador nuevo, restaurar las dos URLs anteriores de Chatfuel
y reactivar el observador anterior. Conservar el secreto compartido durante
la migración mantiene verificables los estados firmados de agenda ya iniciados.
Comprobar cualquier reserva incierta antes de pedir otra para el mismo cliente.

## Datos y pendientes

Las negociaciones y citas continúan almacenadas en 30X/Bitrix. Los atributos y
estados de conversación permanecen en Chatfuel. Este conector usa esos servicios
como persistencia; la migración no requiere copiar una base de datos de DalIA.

La separación del repositorio y Railway no activa el scoring nuevo ni divide
automáticamente los números de WhatsApp. Esos dos cambios siguen pendientes.
Se conservan nombres heredados de atributos por compatibilidad con 30X y con
las conversaciones ya existentes.
