import {
  BadgePercent,
  CalendarCog,
  CalendarHeart,
  CirclePlus,
  ClipboardCheck,
  Coins,
  Flower2,
  FolderHeart,
  Gift,
  HandHeart,
  LayoutDashboard,
  Mail,
  Network,
  Receipt,
  ShieldCheck,
  FileText,
  Files,
  Images,
  Menu,
  MessageCircleHeart,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/generated/prisma/enums";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

const home: NavItem = { href: "/panel", label: "Inicio", icon: LayoutDashboard };
const profile: NavItem = { href: "/panel/perfil", label: "Mi perfil", icon: UserRound };

const donor: NavItem[] = [
  { href: "/panel/donar", label: "Donar", icon: HandHeart },
  { href: "/panel/donaciones", label: "Mis donaciones", icon: Receipt },
  { href: "/panel/actividades", label: "Actividades", icon: CalendarHeart },
  { href: "/panel/recompensas", label: "Recompensas", icon: Gift },
  { href: "/panel/puntos", label: "Mis puntos", icon: Coins },
];

const validation: NavItem[] = [
  { href: "/panel/validar-donaciones", label: "Validar donaciones", icon: ClipboardCheck },
  { href: "/panel/asistencia", label: "Asistencia", icon: ShieldCheck },
  { href: "/panel/mensajes-apoyo", label: "Palabras de apoyo", icon: MessageCircleHeart },
];

export const NAV_BY_ROLE: Record<Role, NavGroup[]> = {
  USER: [{ items: [home, ...donor] }, { title: "Cuenta", items: [profile] }],
  SUPERVISOR: [
    { items: [home] },
    { title: "Validación", items: validation },
    { title: "Mi participación", items: donor },
    { title: "Cuenta", items: [profile] },
  ],
  ADMIN: [
    { items: [home] },
    { title: "Validación", items: validation },
    {
      title: "Gestión",
      items: [
        { href: "/panel/admin/actividades", label: "Actividades", icon: CalendarCog },
        { href: "/panel/admin/recompensas", label: "Recompensas", icon: BadgePercent },
        { href: "/panel/admin/usuarios", label: "Usuarios", icon: Users },
        { href: "/panel/admin/donaciones/nueva", label: "Registrar donación", icon: CirclePlus },
      ],
    },
    {
      title: "Contenido del sitio",
      items: [
        { href: "/panel/admin/contenido", label: "Secciones", icon: FileText },
        { href: "/panel/admin/paginas", label: "Páginas", icon: Files },
        { href: "/panel/admin/menu", label: "Menú", icon: Menu },
        { href: "/panel/admin/medios", label: "Medios", icon: Images },
        { href: "/panel/admin/valores", label: "Valores", icon: Flower2 },
        { href: "/panel/admin/organigrama", label: "Organigrama", icon: Network },
        { href: "/panel/admin/proyectos", label: "Proyectos", icon: FolderHeart },
        { href: "/panel/admin/mensajes", label: "Mensajes", icon: Mail },
      ],
    },
    { title: "Cuenta", items: [profile] },
  ],
};
