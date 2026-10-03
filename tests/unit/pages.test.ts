import { describe, expect, it } from "vitest";
import { blockSchema, isReservedSlug, pageSchema, parseStoredBlocks } from "@/modules/pages/schemas";

describe("blockSchema", () => {
  it("acepta bloques válidos con valores por defecto", () => {
    const b = blockSchema.parse({ id: "1", type: "spacer" });
    expect(b).toEqual({ id: "1", type: "spacer", size: "md", divider: true });
  });

  it("rechaza tipos desconocidos", () => {
    expect(blockSchema.safeParse({ id: "1", type: "html", html: "<script>" }).success).toBe(false);
  });

  it("rechaza enlaces peligrosos en botones", () => {
    expect(blockSchema.safeParse({ id: "1", type: "button", label: "x", href: "javascript:alert(1)" }).success).toBe(false);
    expect(blockSchema.safeParse({ id: "1", type: "button", label: "x", href: "//evil.com" }).success).toBe(false);
    expect(blockSchema.safeParse({ id: "1", type: "button", label: "x", href: "/donar" }).success).toBe(true);
    expect(blockSchema.safeParse({ id: "1", type: "button", label: "x", href: "https://wa.me/591" }).success).toBe(true);
  });

  it("rechaza URLs de imagen no http(s)", () => {
    expect(blockSchema.safeParse({ id: "1", type: "image", url: "data:image/png;base64,AAA" }).success).toBe(false);
  });
});

describe("pageSchema", () => {
  it("lee los bloques en JSON y los checkboxes del formulario", () => {
    const p = pageSchema.parse({
      title: "Transparencia",
      slug: "Transparencia",
      blocks: JSON.stringify([{ id: "a", type: "paragraph", text: "Hola" }]),
      published: "on",
    });
    expect(p.slug).toBe("transparencia");
    expect(p.published).toBe(true);
    expect(p.showInNav).toBe(false);
    expect(p.blocks).toHaveLength(1);
  });

  it("rechaza JSON de bloques inválido", () => {
    expect(pageSchema.safeParse({ title: "Hola", blocks: "{roto" }).success).toBe(false);
  });
});

describe("parseStoredBlocks", () => {
  it("descarta bloques inválidos guardados", () => {
    expect(parseStoredBlocks([{ id: "a", type: "quote", text: "x" }, { type: "nada" }, null])).toHaveLength(1);
    expect(parseStoredBlocks("no es lista")).toEqual([]);
  });
});

describe("isReservedSlug", () => {
  it("protege las rutas del sitio", () => {
    expect(isReservedSlug("donar")).toBe(true);
    expect(isReservedSlug("panel")).toBe(true);
    expect(isReservedSlug("transparencia")).toBe(false);
  });
});
