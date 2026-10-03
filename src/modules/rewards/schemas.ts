import { z } from "zod";

const optionalUuid = z.uuid().optional().or(z.literal("").transform(() => undefined));
const bool = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
const optionalInt = (min: number, max: number) =>
  z
    .union([z.literal(""), z.coerce.number().int().min(min).max(max)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v));

export const allySchema = z.object({
  id: optionalUuid,
  name: z.string().trim().min(2, "Ingresa un nombre").max(120),
  description: z.string().trim().max(1000).default(""),
  website: z.string().trim().max(300).optional().transform((v) => v || null),
  contactEmail: z.string().trim().max(200).optional().transform((v) => v || null),
  logoUrl: z.string().trim().optional(),
  isActive: bool,
});

export const rewardSchema = z.object({
  id: optionalUuid,
  title: z.string().trim().min(3, "Ingresa un título").max(150),
  description: z.string().trim().max(1000).default(""),
  code: z.string().trim().min(2, "Ingresa un código").max(60),
  discountPercent: optionalInt(1, 100),
  pointsCost: z.coerce.number().int().min(1, "Mínimo 1 punto").max(1_000_000),
  stock: optionalInt(0, 1_000_000),
  expiresAt: z
    .union([z.literal(""), z.coerce.date()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  allyId: optionalUuid,
  imageUrl: z.string().trim().optional(),
  isActive: bool,
});

export type AllyInput = z.infer<typeof allySchema>;
export type RewardInput = z.infer<typeof rewardSchema>;
