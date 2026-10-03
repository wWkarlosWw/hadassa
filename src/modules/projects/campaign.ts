/**
 * Lógica pura de campañas (estilo crowdfunding): progreso, días restantes,
 * tiempo relativo, nombres de donantes, filtros y orden. Sin dependencias de
 * servidor para poder usarla en componentes cliente y en tests.
 */

export const CAMPAIGN_SORTS = ["destacadas", "recientes", "cerca-de-la-meta", "mas-recaudado"] as const;
export type CampaignSort = (typeof CAMPAIGN_SORTS)[number];

export const SORT_LABELS: Record<CampaignSort, string> = {
  destacadas: "Destacadas",
  recientes: "Más recientes",
  "cerca-de-la-meta": "Cerca de la meta",
  "mas-recaudado": "Más recaudado",
};

export function parseSort(value: unknown): CampaignSort {
  return CAMPAIGN_SORTS.includes(value as CampaignSort) ? (value as CampaignSort) : "destacadas";
}

/** Porcentaje (0–100, entero) de la meta alcanzada. Sin meta → 0. */
export function progressPercent(raised: number, goal: number | null | undefined) {
  if (!goal || goal <= 0 || !Number.isFinite(raised) || raised <= 0) return 0;
  return Math.min(100, Math.floor((raised / goal) * 100));
}

/** Días que faltan para el cierre (redondeo hacia arriba). null si no hay fecha; 0 si ya cerró. */
export function daysLeft(endsAt: Date | string | null | undefined, now: Date = new Date()) {
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}

/** "hace 2 h", "hace 3 días", "ahora mismo"… */
export function relativeTime(date: Date | string, now: Date = new Date()) {
  const diff = Math.max(0, now.getTime() - new Date(date).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return d === 1 ? "hace 1 día" : `hace ${d} días`;
  const m = Math.floor(d / 30);
  if (m < 12) return m === 1 ? "hace 1 mes" : `hace ${m} meses`;
  const y = Math.floor(d / 365);
  return y <= 1 ? "hace 1 año" : `hace ${y} años`;
}

/** Nombre público del donante: "María P.", "Anónimo" o el nombre registrado a mano. */
export function donorDisplayName(d: { isAnonymous: boolean; fullName?: string | null; donorName?: string | null }, anonymousLabel = "Anónimo") {
  if (d.isAnonymous) return anonymousLabel;
  const name = (d.fullName || d.donorName || "").trim();
  if (!name) return anonymousLabel;
  const [first, ...rest] = name.split(/\s+/);
  const initial = rest.find(Boolean)?.[0];
  return initial ? `${first} ${initial.toUpperCase()}.` : first;
}

export interface CampaignLike {
  name: string;
  tagline: string;
  category: string;
  location: string;
  featured: boolean;
  sortOrder: number;
  createdAt: Date | string;
  raised: number;
  goal: number | null;
}

export function filterCampaigns<T extends CampaignLike>(items: T[], opts: { q?: string; category?: string }) {
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const q = norm(opts.q?.trim() ?? "");
  const category = opts.category?.trim() ?? "";
  return items.filter((c) => {
    if (category && c.category !== category) return false;
    if (!q) return true;
    return norm(`${c.name} ${c.tagline} ${c.category} ${c.location}`).includes(q);
  });
}

export function sortCampaigns<T extends CampaignLike>(items: T[], sort: CampaignSort) {
  const list = [...items];
  const time = (d: Date | string) => new Date(d).getTime();
  switch (sort) {
    case "recientes":
      return list.sort((a, b) => time(b.createdAt) - time(a.createdAt));
    case "cerca-de-la-meta":
      // Las que tienen meta y más avance primero; sin meta al final.
      return list.sort((a, b) => {
        const pa = a.goal ? a.raised / a.goal : -1;
        const pb = b.goal ? b.raised / b.goal : -1;
        return pb - pa;
      });
    case "mas-recaudado":
      return list.sort((a, b) => b.raised - a.raised);
    default:
      return list.sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }
}

/** Montos sugeridos del flujo de donación (como en la app anterior). */
export const QUICK_AMOUNTS = [50, 100, 200, 500, 1000] as const;

/** Elige singular/plural de un texto con {n} (p. ej. "1 donación" / "3 donaciones"). */
export function countLabel(n: number, plural: string, one?: string) {
  return (n === 1 && one ? one : plural).replace(/\{n\}/g, String(n));
}
