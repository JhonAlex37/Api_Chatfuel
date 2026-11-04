# Migración independiente de Chatfuel — 2026-11-04

## Resultado

El repositorio personal `JhonAlex37/Api_Chatfuel`, rama `main`, es el origen
del servicio `Api_Chatfuel` en el proyecto `perceptive-love` de Railway.
Los commits y la conexión de Railway están asociados al repositorio personal.
La carpeta local es `C:\Proyectos\Api_Chatfuel`.

La API está en `https://apichatfuel-production.up.railway.app`. Las acciones
HTTP de inicio y continuación de la agenda de Chatfuel apuntan a `/booking`
en ese dominio. El observador nuevo está activo y el anterior desactivado.
Se conservaron el secreto compartido y los atributos, por lo que los estados
firmados existentes continúan siendo verificables.

Las nueve variables son propias del servicio nuevo: las referencias anteriores
a otro servicio de DalIA se resolvieron antes de transferir los valores.
Las negociaciones y citas siguen en 30X/Bitrix; los atributos siguen en Chatfuel.

## Respaldo de reversión

El servicio anterior `chatfuel-bitrix-booking` quedó sin observador y con modo
de suspensión configurado. Se conserva para reversión, dentro del proyecto DalIA:

- Proyecto: `f738779e-2840-495c-b09b-0c2597c814cd`.
- Servicio: `ff561cac-0a81-4561-9aa6-661f0bcb537b`.
- Entorno: `4a4e8414-0996-48c2-977f-58678ae59d0e`.
- URL anterior: `https://chatfuel-bitrix-booking-production-68a2.up.railway.app`.

Para revertir, desactivar primero el observador nuevo, restaurar las dos URLs
de Chatfuel y activar el anterior. Comprobar reservas inciertas antes de
solicitar otra cita. La eliminación del respaldo requiere instrucción del usuario.

## Alcance conservado

Las preguntas y el scoring del motor original de DalIA mantienen su configuración.
La separación del despliegue no activa el scoring nuevo de Chatfuel ni divide
automáticamente los números de WhatsApp. La reserva completa con una conversación
real sigue siendo una prueba funcional pendiente. Algunos nombres de atributos
se conservan por compatibilidad con el contrato de 30X y conversaciones existentes.

## Integración de la API de registro

Se integró el código de registro MySQL publicado en Proyecta-SAS/Api_Chatfuel
a la API personal de Chatfuel. En Railway se utiliza el mismo servicio
Api_Chatfuel y su dominio; MySQL permanece como servicio aparte. No se
requiere otro servicio de agenda ni cambiar las URLs del flujo de Chatfuel.
