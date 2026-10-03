import { z } from "zod";
import { safeHref } from "@/modules/pages/schemas";

const bool = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const menuItemSchema = z.object({
  id: z.uuid().optional().or(z.literal("").transform(() => undefined)),
  label: z.string().trim().min(1, "Ingresa un texto").max(60),
  href: safeHref.refine((v) => v !== "", "Ingresa un enlace"),
  location: z.enum(["HEADER", "FOOTER"]),
  sortOrder: z.coerce.number().int().default(0),
  isVisible: bool,
  openInNewTab: bool,
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;

/** Enlaces por defecto (si la tabla está vacía, el sitio usa estos). */
export const DEFAULT_MENU: { label: string; href: string; location: "HEADER" | "FOOTER" }[] = [
  { label: "Inicio", href: "/", location: "HEADER" },
  { label: "Nosotros", href: "/nosotros", location: "HEADER" },
  { label: "Proyectos y donaciones", href: "/donar", location: "HEADER" },
  { label: "Casa de Fruto", href: "/casa-de-fruto", location: "HEADER" },
  { label: "Actividades", href: "/actividades", location: "HEADER" },
  { label: "Contacto", href: "/contacto", location: "HEADER" },
  { label: "Inicio", href: "/", location: "FOOTER" },
  { label: "Nosotros", href: "/nosotros", location: "FOOTER" },
  { label: "Proyectos y donaciones", href: "/donar", location: "FOOTER" },
  { label: "Casa de Fruto", href: "/casa-de-fruto", location: "FOOTER" },
  { label: "Actividades", href: "/actividades", location: "FOOTER" },
  { label: "Contacto", href: "/contacto", location: "FOOTER" },
  { label: "Mi cuenta", href: "/ingresar", location: "FOOTER" },
];
