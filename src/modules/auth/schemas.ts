import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Ingresa un correo válido")),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "Ingresa tu nombre completo").max(120),
    email: z.string().trim().toLowerCase().pipe(z.email("Ingresa un correo válido")),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\s-]{7,15}$/, "Ingresa un teléfono válido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Za-z]/, "Debe incluir letras")
      .regex(/[0-9]/, "Debe incluir números"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
