# V1.0.1: Ofrece horarios libres más separados

La agenda elige el primer y el último inicio libre del día y franja elegidos,
y el hueco libre más cercano al punto medio entre ellos. Las opciones se
ordenan de menor a mayor y proceden de la consulta real de disponibilidad.

Por ejemplo, si Bitrix ofrece 08:30, 08:40, 10:40 y 11:20, se muestran 08:30,
10:40 y 11:20. No se ofrecen horas ocupadas ni se inventan horarios fijos.
Un mismo inicio no se repite aunque esté disponible con dos asesores.

Entre las opciones ofrecidas se deja al menos un intervalo libre de diez
minutos. Si quedan solo 08:30, 08:40 y 08:50, se ofrecen 08:30 y 08:50; si
quedan solo dos horas consecutivas, se ofrece una. La duración de cada llamada
sigue siendo diez minutos. Esto no bloquea otros huecos del calendario.

Elegir un horario sigue sin reservarlo: se pide confirmación explícita y la
API vuelve a validar la disponibilidad al crear la cita. Pedir más opciones
excluye los horarios que ya se mostraron.

Esta publicación no incorpora el endpoint MySQL preparado por otro colaborador
ni el cambio de nombre «Cita DalIA (Chatfuel)», que permanece pendiente.
