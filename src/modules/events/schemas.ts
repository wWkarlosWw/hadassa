import { z } from "zod";

const optionalUuid = z.uuid().optional().or(z.literal("").transform(() => undefined));
const optionalInt = z
  .union([z.literal(""), z.coerce.number().int().min(1)])
  .optional()
  .transform((v) => (v === "" || v === undefined ? null : v));

export const eventSchema = z
  .object({
    id: optionalUuid,
    title: z.string().trim().min(3, "Ingresa un título").max(150),
    description: z.string().trim().max(5000).default(""),
    location: z.string().trim().max(200).default(""),
    startsAt: z.coerce.date({ message: "Fecha inválida" }),
    endsAt: z
      .union([z.literal(""), z.coerce.date()])
      .optional()
      .transform((v) => (v === "" || v === undefined ? null : v)),
    capacity: optionalInt,
    pointsReward: z.coerce.number().int().min(0).max(10000).default(50),
    projectId: optionalUuid,
    isActive: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
    imageUrl: z.string().trim().optional(),
  })
  .refine((d) => !d.endsAt || d.endsAt >= d.startsAt, { path: ["endsAt"], message: "Debe ser posterior al inicio" });

export type EventInput = z.infer<typeof eventSchema>;
