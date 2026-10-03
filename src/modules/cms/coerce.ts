import { SITE_SECTIONS, type FieldDef, type ListItem, type SectionContent, type SectionKey } from "./definitions";

const MAX_LIST_ITEMS = 50;
const MAX_TEXT = 5000;

/** Normaliza una lista repetible: solo objetos con los sub-campos definidos (texto). */
export function coerceList(field: Pick<FieldDef, "itemFields">, raw: unknown): ListItem[] {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  const subFields = field.itemFields ?? [];
  const out: ListItem[] = [];
  for (const entry of value.slice(0, MAX_LIST_ITEMS)) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const item: ListItem = {};
    let hasContent = false;
    for (const sub of subFields) {
      const v = (entry as Record<string, unknown>)[sub.name];
      const text = typeof v === "string" || typeof v === "number" ? String(v).trim().slice(0, MAX_TEXT) : "";
      item[sub.name] = text;
      if (text) hasContent = true;
    }
    if (hasContent) out.push(item);
  }
  return out;
}

export function coerceToggle(raw: unknown, fallback: boolean) {
  if (typeof raw === "boolean") return raw;
  if (raw === "on" || raw === "true") return true;
  if (raw === "false" || raw === "off" || raw === "") return false;
  return fallback;
}

/** Combina lo guardado con los valores por defecto, validando el tipo de cada campo. */
export function coerceSection<K extends SectionKey>(key: K, raw: unknown): SectionContent<K> {
  const def = SITE_SECTIONS[key];
  const defaults = def.defaults as Record<string, unknown>;
  const stored = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const fields = new Map<string, FieldDef>(def.fields.map((f) => [f.name, f as FieldDef]));
  const out: Record<string, unknown> = {};

  for (const [name, fallback] of Object.entries(defaults)) {
    const v = stored[name];
    const field = fields.get(name);
    if (field?.type === "list" || Array.isArray(fallback)) {
      out[name] = v === undefined ? fallback : coerceList(field ?? {}, v);
    } else if (typeof fallback === "boolean") {
      out[name] = v === undefined ? fallback : coerceToggle(v, fallback);
    } else if (typeof fallback === "number") {
      const n = typeof v === "number" ? v : Number(v);
      out[name] = v !== undefined && v !== "" && v !== null && Number.isFinite(n) ? n : fallback;
    } else {
      out[name] = typeof v === "string" ? v.slice(0, MAX_TEXT * 4) : fallback;
    }
  }
  return out as SectionContent<K>;
}
