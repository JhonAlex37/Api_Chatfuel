// Adaptado del código del proyecto de referencia del usuario; módulo autónomo.
export function requireBitrixEventId(value) {
    const eventId = String(value ?? "").trim();
    if (!/^[1-9]\d*$/.test(eventId)) {
        throw new Error("Bitrix no confirmó la creación del evento en el calendario.");
    }
    return eventId;
}
