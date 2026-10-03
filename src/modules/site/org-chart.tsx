import Image from "next/image";
import {
  BookOpen,
  ClipboardList,
  Compass,
  GraduationCap,
  HandCoins,
  HandHeart,
  Heart,
  Megaphone,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface OrgAreaView {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  stethoscope: Stethoscope,
  "hand-coins": HandCoins,
  megaphone: Megaphone,
  "clipboard-list": ClipboardList,
  "graduation-cap": GraduationCap,
  heart: Heart,
  users: Users,
  "book-open": BookOpen,
  "hand-heart": HandHeart,
};

function AreaIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Heart;
  return <Icon className={className} aria-hidden />;
}

/** Organigrama general: solo áreas, alrededor del sello de Hadassa. */
export function OrgChart({ areas }: { areas: OrgAreaView[] }) {
  const n = Math.max(areas.length, 1);
  const points = areas.map((a, i) => {
    const angle = (-90 + (360 / n) * i) * (Math.PI / 180);
    return { ...a, x: 50 + Math.cos(angle) * 38, y: 50 + Math.sin(angle) * 38 };
  });

  return (
    <>
      {/* Radial (tablet/escritorio) */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-3xl md:block">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          <circle cx="50" cy="50" r="38" fill="none" stroke="var(--color-borde)" strokeWidth="0.3" strokeDasharray="1 1.2" />
          {points.map((p) => (
            <line key={p.id} x1="50" y1="50" x2={p.x} y2={p.y} stroke={p.color} strokeWidth="0.45" opacity="0.7" />
          ))}
        </svg>
        <div className="absolute left-1/2 top-1/2 grid w-[26%] -translate-x-1/2 -translate-y-1/2 place-items-center">
          <div className="rounded-full bg-papel p-2 shadow-[var(--shadow-flor)] ring-4 ring-[#ecd18a]/70">
            <Image src="/brand/logo.webp" alt="Fundación Hadassa" width={220} height={220} className="h-auto w-full" />
          </div>
          <p className="eyebrow mt-3 text-[0.65rem] text-tinta-suave">Fundación</p>
        </div>
        {points.map((p) => (
          <div
            key={p.id}
            className="group absolute flex w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            tabIndex={0}
          >
            <span
              className="grid size-20 place-items-center rounded-full text-white shadow-lg ring-4 ring-papel transition duration-300 group-hover:scale-110 group-focus:scale-110"
              style={{ background: p.color }}
            >
              <AreaIcon name={p.icon} className="size-8" />
            </span>
            <p className="eyebrow mt-3 text-[0.68rem] leading-snug text-tinta">{p.name}</p>
            {p.description && (
              <p className="pointer-events-none absolute top-full z-10 mt-2 w-56 rounded-xl bg-papel p-3 text-xs leading-relaxed text-tinta-suave opacity-0 shadow-xl ring-1 ring-borde transition group-hover:opacity-100 group-focus:opacity-100">
                {p.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Lista (móvil) */}
      <div className="md:hidden">
        <div className="mx-auto mb-6 w-32 rounded-full bg-papel p-2 shadow-[var(--shadow-flor)]">
          <Image src="/brand/logo.webp" alt="Fundación Hadassa" width={160} height={160} className="h-auto w-full" />
        </div>
        <ul className="relative space-y-3 border-l-2 border-dashed border-borde pl-6">
          {areas.map((a) => (
            <li key={a.id} className="relative flex items-start gap-4 rounded-2xl bg-papel p-4 shadow-[var(--shadow-suave)]">
              <span className="absolute -left-[1.95rem] top-7 size-3 rounded-full ring-4 ring-crema" style={{ background: a.color }} aria-hidden />
              <span className="grid size-12 shrink-0 place-items-center rounded-full text-white" style={{ background: a.color }}>
                <AreaIcon name={a.icon} className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-tinta">{a.name}</p>
                {a.description && <p className="mt-0.5 text-sm text-tinta-suave">{a.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
