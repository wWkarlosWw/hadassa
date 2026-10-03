import { z } from "zod";

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(3, "Ingresa tu nombre completo").max(120),
  phone: z.string().trim().max(20).optional().transform((v) => v || null),
  ci: z.string().trim().max(20).optional().transform((v) => v || null),
  address: z.string().trim().max(200).optional().transform((v) => v || null),
});

export const adminUserUpdateSchema = z.object({
  id: z.uuid(),
  role: z.enum(["USER", "SUPERVISOR", "ADMIN"]),
  isActive: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
});

export const adjustPointsSchema = z.object({
  id: z.uuid(),
  amount: z.coerce.number().int().refine((n) => n !== 0, "No puede ser 0"),
  description: z.string().trim().min(3, "Indica el motivo").max(200),
});

export const createUserSchema = z.object({
  fullName: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().pipe(z.email("Correo inválido")),
  phone: z.string().trim().max(20).optional().transform((v) => v || null),
  role: z.enum(["USER", "SUPERVISOR", "ADMIN"]),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
