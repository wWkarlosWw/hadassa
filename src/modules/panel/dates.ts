/** Fecha → valor para <input type="datetime-local"> en hora de Bolivia (UTC-4). */
export function toLocalInput(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = new Date(new Date(date).getTime() - 4 * 3600 * 1000);
  return d.toISOString().slice(0, 16);
}

/** Fecha → valor para <input type="date">. */
export function toDateInput(date: Date | string | null | undefined) {
  return toLocalInput(date).slice(0, 10);
}

/** ¿La fecha ya pasó? `graceMs` permite un margen (p. ej. eventos del día). */
export function isPast(date: Date | string, graceMs = 0) {
  return new Date(date).getTime() < Date.now() - graceMs;
}
