# Configuración de conversación y prueba de agenda

La configuración `rch-questions-v3-2026-11-04` agrega un saludo amable al
retomar y una nueva revisión cuando el cliente pide empezar de cero. Mantiene
el trato de usted, una pregunta por mensaje y el cuestionario RCH existente.
El banco, la cobertura, el saldo pendiente en dinero, los años pagando y las
cuotas vencidas conservan sus definiciones.

`config/chatfuel/rch-questions.json` es la referencia versionada. El prompt
se aplica en la automatización principal de Chatfuel y se verifica leyéndolo
de nuevo; desplegar el conector de Railway no publica ese prompt por sí solo.
Los ajustes de la plataforma y el servicio de agenda tienen ciclos distintos.

## Nueva revisión con un contacto usado

Chatfuel conserva el historial del contacto y no ofrece borrarlo o reiniciarlo,
según su documentación: https://chatfuel.com/docs/leads/can-i-clear-chat-history.
Una nueva revisión no equivale a eliminar ese historial ni garantiza que el
modelo no tenga acceso técnico a él: el prompt le indica que use solamente
las respuestas posteriores a la nueva solicitud.

Antes de limpiar los atributos de perfil de un contacto de prueba autorizado,
guardar una copia fuera de Git y comprobar que no haya una reserva pendiente
o confirmada. Conservar el identificador de 30X, las marcas de sincronización
y todos los datos de citas reales. No eliminar contactos, negociaciones,
conversaciones ni conexiones para ejecutar esta prueba.

El cliente inicia con «Hola, quiero empezar de cero». La IA debe saludar y
preguntar por el banco, sin reutilizar el banco ni otros datos anteriores.
Comprobar la respuesta real; una lectura correcta del prompt no valida por sí
sola el comportamiento del modelo.

## Prueba de agendamiento

1. Completar las preguntas RCH con datos proporcionados en la nueva revisión.
2. Aceptar la propuesta de una llamada o pedirla de forma natural.
3. Completar nombre, ciudad y obligación activa si faltan; no son requisitos
   del primer saludo.
4. Elegir franja, día y uno de los horarios consultados en Bitrix.
5. Confirmar expresamente la reserva del horario elegido.
6. Verificar el identificador del evento y la cita de diez minutos en Bitrix,
   y que la misma negociación de 30X conserve el comentario del perfil nuevo.

La disponibilidad consultada no significa que exista una reserva. No crear
una cita de prueba automáticamente: la persona debe elegir y confirmarla.
Una reserva incierta necesita verificación antes de intentar otra.

El scoring nuevo de Chatfuel sigue pendiente. El motor y scoring original
de DalIA no forman parte de este cambio.
