import { z } from "zod";

export const createDonationSchema = z.object({
  amount: z.coerce.number().positive("Ingresa un monto válido").max(1_000_000, "Monto demasiado alto"),
  method: z.enum(["QR", "TRANSFER", "CASH", "OTHER"]).default("QR"),
  reference: z.string().trim().max(120).optional().transform((v) => v || undefined),
  note: z.string().trim().max(500).optional().transform((v) => v || undefined),
  projectId: z.uuid().optional().or(z.literal("").transform(() => undefined)),
  eventId: z.uuid().optional().or(z.literal("").transform(() => undefined)),
  isAnonymous: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()).default(false),
  isRecurring: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()).default(false),
  message: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .transform((v) => v || undefined),
});

export const messageVisibilitySchema = z.object({
  id: z.uuid(),
  hidden: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
});

export const rejectDonationSchema = z.object({
  id: z.uuid(),
  reason: z.string().trim().max(300).optional(),
});

type ParsedDonation = z.infer<typeof createDonationSchema>;
/** Datos validados de una donación; los campos de texto opcionales pueden omitirse. */
export type CreateDonationInput = Omit<ParsedDonation, "reference" | "note" | "message" | "isAnonymous" | "isRecurring"> &
  Partial<Pick<ParsedDonation, "reference" | "note" | "message" | "isAnonymous" | "isRecurring">>;
