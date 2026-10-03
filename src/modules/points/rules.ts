/** Reglas puras del programa de puntos (sin dependencias, fáciles de testear). */

export function pointsForDonation(amount: number, pointsPerBoliviano: number) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (!Number.isFinite(pointsPerBoliviano) || pointsPerBoliviano <= 0) return 0;
  return Math.floor(amount * pointsPerBoliviano);
}

export function canAfford(balance: number, cost: number) {
  return cost >= 0 && balance >= cost;
}

/** Nivel del donante según puntos acumulados históricamente. */
export const LEVELS = [
  { min: 0, name: "Semilla", color: "#b68286" },
  { min: 500, name: "Brote", color: "#8e9ace" },
  { min: 2000, name: "Flor", color: "#E3AAAA" },
  { min: 5000, name: "Fruto", color: "#7f5153" },
  { min: 15000, name: "Árbol de mirto", color: "#525a77" },
] as const;

export function levelFor(totalEarned: number) {
  let current: (typeof LEVELS)[number] = LEVELS[0];
  let next: (typeof LEVELS)[number] | null = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (totalEarned >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    }
  }
  const progress = next ? (totalEarned - current.min) / (next.min - current.min) : 1;
  return { current, next, progress: Math.max(0, Math.min(1, progress)) };
}
