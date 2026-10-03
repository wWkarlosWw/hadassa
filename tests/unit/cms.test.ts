import { describe, expect, it } from "vitest";
import { coerceList, coerceSection, coerceToggle } from "@/modules/cms/coerce";
import { SITE_SECTIONS, fillTemplate, isSectionKey } from "@/modules/cms/definitions";

describe("coerceSection", () => {
  it("sin datos guardados devuelve los valores por defecto", () => {
    const home = coerceSection("home", undefined);
    expect(home.heroTitle).toBe(SITE_SECTIONS.home.defaults.heroTitle);
    expect(home.stats).toEqual([]);
  });

  it("combina lo guardado con los defaults y descarta tipos inválidos", () => {
    const g = coerceSection("gamification", { pointsPerBoliviano: "5", minDonation: "abc" });
    expect(g.pointsPerBoliviano).toBe(5);
    expect(g.minDonation).toBe(SITE_SECTIONS.gamification.defaults.minDonation);
  });

  it("interpreta toggles", () => {
    expect(coerceSection("site", { announcementEnabled: "on" }).announcementEnabled).toBe(true);
    expect(coerceSection("site", { announcementEnabled: false }).announcementEnabled).toBe(false);
    expect(coerceSection("site", {}).announcementEnabled).toBe(false);
  });

  it("normaliza listas guardadas", () => {
    const home = coerceSection("home", {
      stats: [{ value: "120+", label: "niños", extra: "x" }, { value: "", label: "" }, "basura"],
    });
    expect(home.stats).toEqual([{ value: "120+", label: "niños" }]);
  });

  it("una lista vacía guardada reemplaza a la de por defecto", () => {
    expect(coerceSection("site", { subBrands: [] }).subBrands).toEqual([]);
  });
});

describe("coerceList", () => {
  const field = { itemFields: [{ name: "quote", label: "Q", type: "textarea" as const }, { name: "author", label: "A", type: "text" as const }] };

  it("acepta JSON en texto (como llega del formulario)", () => {
    expect(coerceList(field, JSON.stringify([{ quote: " Hola ", author: "Ana" }]))).toEqual([{ quote: "Hola", author: "Ana" }]);
  });

  it("ignora JSON inválido y valores que no son listas", () => {
    expect(coerceList(field, "{no es json")).toEqual([]);
    expect(coerceList(field, { quote: "x" })).toEqual([]);
  });

  it("limita la cantidad de elementos", () => {
    const many = Array.from({ length: 80 }, (_, i) => ({ quote: `q${i}`, author: "a" }));
    expect(coerceList(field, many)).toHaveLength(50);
  });
});

describe("utilidades", () => {
  it("coerceToggle", () => {
    expect(coerceToggle("true", false)).toBe(true);
    expect(coerceToggle(undefined, true)).toBe(true);
  });

  it("fillTemplate reemplaza variables conocidas", () => {
    expect(fillTemplate("{n} cupos disponibles", { n: 3 })).toBe("3 cupos disponibles");
    expect(fillTemplate("Hola {nombre}", {})).toBe("Hola {nombre}");
  });

  it("isSectionKey no acepta propiedades heredadas", () => {
    expect(isSectionKey("home")).toBe(true);
    expect(isSectionKey("toString")).toBe(false);
  });

  it("todo campo definido tiene valor por defecto", () => {
    for (const [key, def] of Object.entries(SITE_SECTIONS)) {
      for (const f of def.fields) expect(def.defaults, `${key}.${f.name}`).toHaveProperty(f.name);
    }
  });
});
