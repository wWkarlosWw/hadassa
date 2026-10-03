"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface TreeValue {
  id: string;
  title: string;
  description: string;
}

// Posición (%) de cada fruto sobre la copa, como en la maqueta (3 × 3).
const SPOTS = [
  { x: 22, y: 27 },
  { x: 50, y: 15 },
  { x: 78, y: 28 },
  { x: 17, y: 51 },
  { x: 50, y: 42 },
  { x: 82, y: 53 },
  { x: 28, y: 73 },
  { x: 52, y: 68 },
  { x: 75, y: 76 },
];

/** Generador pseudoaleatorio determinista (mismo SVG en servidor y cliente). */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Redondea para que servidor y navegador generen exactamente el mismo SVG. */
const r1 = (n: number) => Math.round(n * 10) / 10;

function MirtoTree() {
  const rand = seeded(7);
  const blossoms = Array.from({ length: 140 }, () => {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    return {
      cx: r1(500 + Math.cos(a) * r * 420),
      cy: r1(400 + Math.sin(a) * r * 330),
      r: r1(26 + rand() * 46),
      fill: ["#f1cfcf", "#e3aaaa", "#efb8c4", "#d98fa0", "#f6dde2", "#c97f8a"][Math.floor(rand() * 6)],
      o: r1(0.55 + rand() * 0.4),
    };
  });
  const flowers = Array.from({ length: 70 }, () => {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    return { x: r1(500 + Math.cos(a) * r * 430), y: r1(400 + Math.sin(a) * r * 340), s: r1(5 + rand() * 6) };
  });
  return (
    <svg viewBox="0 0 1000 1000" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <linearGradient id="tronco" x1="0" x2="1">
          <stop offset="0" stopColor="#8a6a5c" />
          <stop offset="0.5" stopColor="#b8998a" />
          <stop offset="1" stopColor="#7d5e51" />
        </linearGradient>
      </defs>
      {/* Tronco y ramas */}
      <path d="M470 1000c10-120 6-260-6-380l-90-120 18-8 92 104 2-110 22 0 4 120 96-118 16 10-98 134c-8 120-12 260-2 368z" fill="url(#tronco)" />
      {/* Copa */}
      {blossoms.map((b, i) => (
        <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.fill} opacity={b.o} />
      ))}
      {/* Florecitas de mirto */}
      {flowers.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`} fill="#fff" opacity="0.85">
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} rx={f.s * 0.45} ry={f.s} transform={`rotate(${r}) translate(0 ${-f.s * 0.8})`} />
          ))}
          <circle r={f.s * 0.35} fill="#d4a94e" />
        </g>
      ))}
      {/* Pasto */}
      <ellipse cx="500" cy="990" rx="300" ry="26" fill="#e9d9c9" opacity="0.6" />
    </svg>
  );
}

function Fruit({
  value,
  index,
  onOpen,
  className,
  style,
}: {
  value: TreeValue;
  index: number;
  onOpen: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("flex flex-col items-center", className)}
      style={{ ...style, transformOrigin: "50% 0%" }}
      initial={reduce ? false : { opacity: 0, y: -30, scale: 0.6 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 140, damping: 12, delay: 0.1 * index }}
    >
      {/* Cuerda y hoja */}
      <span className="h-6 w-px bg-[#9b7b62]" aria-hidden />
      <motion.button
        type="button"
        onClick={onOpen}
        animate={reduce ? undefined : { rotate: [-3, 3, -3] }}
        transition={{ duration: 4 + (index % 3), repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
        whileHover={{ scale: 1.12 }}
        whileFocus={{ scale: 1.12 }}
        style={{ transformOrigin: "50% -24px" }}
        className="relative grid aspect-square w-[clamp(5.5rem,13vw,9rem)] place-items-center rounded-full bg-rosa p-3 text-center shadow-[0_10px_25px_-8px_rgba(127,81,83,0.55)] ring-4 ring-white/70 outline-offset-4"
        aria-haspopup="dialog"
      >
        <span className="absolute inset-1.5 rounded-full border border-white/70" aria-hidden />
        <span className="font-script text-[clamp(1.05rem,2.1vw,1.6rem)] leading-tight text-vino-700">{value.title}</span>
      </motion.button>
    </motion.div>
  );
}

/** Los valores se ven como frutos del árbol de mirto (maqueta, pág. 10). */
export function ValuesTree({ values }: { values: TreeValue[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = values.find((v) => v.id === openId) ?? null;
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onTree = values.slice(0, SPOTS.length);
  const extra = values.slice(SPOTS.length);

  return (
    <div>
      {/* Escritorio/tablet: frutos colgando de la copa */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-4xl sm:block">
        <MirtoTree />
        {onTree.map((v, i) => (
          <Fruit
            key={v.id}
            value={v}
            index={i}
            onOpen={() => setOpenId(v.id)}
            className="absolute -translate-x-1/2"
            style={{ left: `${SPOTS[i].x}%`, top: `calc(${SPOTS[i].y}% - 4.5rem)` }}
          />
        ))}
      </div>

      {/* Móvil: todos los frutos en cuadrícula */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:hidden">
        {values.map((v, i) => (
          <Fruit key={v.id} value={v} index={i} onOpen={() => setOpenId(v.id)} />
        ))}
      </div>
      {/* Valores que no caben en la copa */}
      {extra.length > 0 && (
        <div className="mt-8 hidden grid-cols-4 gap-4 sm:grid">
          {extra.map((v, i) => (
            <Fruit key={v.id} value={v} index={i} onOpen={() => setOpenId(v.id)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center bg-noche-900/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenId(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative grid aspect-square w-full max-w-sm place-items-center rounded-full bg-rosa p-10 text-center shadow-2xl ring-8 ring-white/80"
              initial={{ scale: 0.5, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="absolute inset-3 rounded-full border border-white/80" aria-hidden />
              <div className="relative">
                <p className="text-white/90" aria-hidden>
                  ✿ ❀ ✿
                </p>
                <h3 id={titleId} className="mt-2 font-script text-4xl text-vino-700">
                  {open.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-vino-700">{open.description}</p>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setOpenId(null)}
                className="absolute right-6 top-6 grid size-9 place-items-center rounded-full bg-white/80 text-vino-700 transition hover:bg-white"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
