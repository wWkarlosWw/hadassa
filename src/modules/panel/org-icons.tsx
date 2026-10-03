import {
  BookOpen,
  Church,
  ClipboardList,
  Compass,
  GraduationCap,
  HandCoins,
  Heart,
  HeartHandshake,
  Megaphone,
  Sprout,
  Stethoscope,
  Users,
  Utensils,
  Baby,
  type LucideIcon,
} from "lucide-react";

/** Iconos disponibles para las áreas del organigrama (clave = nombre kebab de lucide). */
export const ORG_ICONS: Record<string, { label: string; Icon: LucideIcon }> = {
  compass: { label: "Brújula (dirección)", Icon: Compass },
  stethoscope: { label: "Estetoscopio (salud)", Icon: Stethoscope },
  "hand-coins": { label: "Monedas (fondos)", Icon: HandCoins },
  megaphone: { label: "Megáfono (comunicación)", Icon: Megaphone },
  "clipboard-list": { label: "Lista (administración)", Icon: ClipboardList },
  "graduation-cap": { label: "Birrete (educación)", Icon: GraduationCap },
  heart: { label: "Corazón", Icon: Heart },
  "heart-handshake": { label: "Manos (voluntariado)", Icon: HeartHandshake },
  users: { label: "Personas", Icon: Users },
  "book-open": { label: "Libro (formación)", Icon: BookOpen },
  church: { label: "Iglesia (espiritual)", Icon: Church },
  sprout: { label: "Brote", Icon: Sprout },
  utensils: { label: "Cubiertos (alimentación)", Icon: Utensils },
  baby: { label: "Bebé (infancia)", Icon: Baby },
};

export function OrgIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ORG_ICONS[name]?.Icon ?? Heart;
  return <Icon className={className} aria-hidden />;
}
