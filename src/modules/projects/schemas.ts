import { z } from "zod";

const bool = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const projectSchema = z.object({
  id: z.uuid().optional().or(z.literal("").transform(() => undefined)),
  name: z.string().trim().min(2, "Ingresa un nombre").max(120),
  slug: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9-]*$/, "Solo minúsculas, números y guiones")
    .optional(),
  tagline: z.string().trim().max(300).default(""),
  description: z.string().trim().max(10000).default(""),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido").default("#E3AAAA"),
  goal: z
    .union([z.literal(""), z.coerce.number().min(0)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  beneficiaries: z.coerce.number().int().min(0).default(0),
  sortOrder: z.coerce.number().int().default(0),
  featured: bool,
  isActive: bool,
  logoUrl: z.string().trim().optional(),
  coverUrl: z.string().trim().optional(),
  // Campaña
  category: z.string().trim().max(60).default(""),
  location: z.string().trim().max(120).default(""),
  story: z.string().trim().max(20000).default(""),
  endsAt: z
    .union([z.literal(""), z.coerce.date({ message: "Fecha inválida" })])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  acceptsDonations: bool,
  isMain: bool,
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const projectUpdateSchema = z.object({
  id: z.uuid().optional().or(z.literal("").transform(() => undefined)),
  projectId: z.uuid(),
  title: z.string().trim().min(3, "Ingresa un título").max(150),
  body: z.string().trim().max(5000).default(""),
  imageUrl: z.string().trim().optional(),
});

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
