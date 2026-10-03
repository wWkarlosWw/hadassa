import { z } from "zod";

/** Rutas propias del sitio: una página personalizada no puede usarlas. */
export const RESERVED_SLUGS = [
  "nosotros",
  "proyectos",
  "casa-de-fruto",
  "donar",
  "actividades",
  "contacto",
  "ingresar",
  "registro",
  "panel",
  "auth",
  "api",
  "sitemap.xml",
  "robots.txt",
  "icon.png",
  "brand",
  "images",
  "petals",
] as const;

const text = (max: number) => z.string().trim().max(max).default("");

/** Enlace seguro: ruta interna, ancla, http(s), mailto: o tel:. */
export const safeHref = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(v), "Usa una ruta (/donar) o una URL que empiece con https://");

/** URL de imagen: ruta pública local o URL http(s). */
const imageUrl = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || /^(\/(?!\/)|https?:\/\/)/i.test(v), "URL de imagen inválida")
  .default("");

const id = z.string().min(1).max(64);

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ id, type: z.literal("heading"), text: text(200), level: z.enum(["2", "3"]).default("2") }),
  z.object({ id, type: z.literal("paragraph"), text: text(10000) }),
  z.object({ id, type: z.literal("image"), url: imageUrl, alt: text(200), caption: text(300) }),
  z.object({ id, type: z.literal("quote"), text: text(1000), author: text(120) }),
  z.object({
    id,
    type: z.literal("button"),
    label: text(80),
    href: safeHref.default(""),
    variant: z.enum(["primary", "vino", "outline"]).default("primary"),
  }),
  z.object({ id, type: z.literal("video"), url: text(500), title: text(200) }),
  z.object({
    id,
    type: z.literal("columns"),
    title: text(200),
    text: text(5000),
    imageUrl,
    imageAlt: text(200),
    imageSide: z.enum(["left", "right"]).default("right"),
  }),
  z.object({ id, type: z.literal("spacer"), size: z.enum(["sm", "md", "lg"]).default("md"), divider: z.boolean().default(true) }),
]);

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];
export const blocksSchema = z.array(blockSchema).max(100, "Máximo 100 bloques por página");

export const BLOCK_LABELS: Record<BlockType, string> = {
  heading: "Título",
  paragraph: "Párrafo",
  image: "Imagen",
  quote: "Cita",
  button: "Botón",
  video: "Video",
  columns: "Texto + imagen",
  spacer: "Separador",
};

const bool = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const pageSchema = z.object({
  id: z.uuid().optional().or(z.literal("").transform(() => undefined)),
  title: z.string().trim().min(2, "Ingresa un título").max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80)
    .regex(/^[a-z0-9-]*$/, "Solo minúsculas, números y guiones")
    .optional(),
  excerpt: text(400),
  coverUrl: z.string().trim().optional(),
  blocks: z.preprocess((v) => {
    if (typeof v !== "string") return v;
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }, blocksSchema),
  published: bool,
  showInNav: bool,
  showInFooter: bool,
  sortOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().trim().max(150).optional().transform((v) => v || null),
  seoDescription: z.string().trim().max(300).optional().transform((v) => v || null),
});

export type PageInput = z.infer<typeof pageSchema>;

/** Lee los bloques guardados en la base ignorando los inválidos. */
export function parseStoredBlocks(raw: unknown): Block[] {
  if (!Array.isArray(raw)) return [];
  const out: Block[] = [];
  for (const b of raw) {
    const r = blockSchema.safeParse(b);
    if (r.success) out.push(r.data);
  }
  return out;
}

export function isReservedSlug(slug: string) {
  return (RESERVED_SLUGS as readonly string[]).includes(slug);
}
