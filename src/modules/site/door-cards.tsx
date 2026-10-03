"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface DoorProject {
  slug: string;
  name: string;
  tagline: string;
  color: string;
  logoUrl: string | null;
  coverUrl?: string | null;
}

/** Aclara un color hex mezclándolo con blanco (para el interior de la puerta). */
function tint(hex: string, amount: number, alpha = 1) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix((n >> 16) & 255)} ${mix((n >> 8) & 255)} ${mix(n & 255)} / ${alpha})`;
}

function DoorCard({ project, index, cta }: { project: DoorProject; index: number; cta: string }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  // Se observa el <li>: la puerta rotada casi no tiene área visible.
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const href = project.slug === "casa-de-fruto" ? "/casa-de-fruto" : `/proyectos/${project.slug}`;

  return (
    <motion.li
      ref={ref}
      className="mx-auto w-full max-w-xs list-none sm:max-w-none"
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="group relative aspect-[3/4] w-full [perspective:1400px]"
        data-open={open || undefined}
        onMouseLeave={() => setOpen(false)}
      >
        {/* Interior: se ve al abrir la puerta */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-end gap-5 overflow-hidden rounded-[1.75rem] p-7 text-center shadow-inner"
          style={{ background: tint(project.color, 0.72) }}
        >
          {project.coverUrl && (
            <>
              <Image src={project.coverUrl} alt="" fill sizes="(min-width: 1024px) 25vw, 80vw" className="object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to top, ${tint(project.color, 0.82, 0.97)} 30%, ${tint(project.color, 0.82, 0.55)} 52%, ${tint(project.color, 0.82, 0)} 78%)` }}
                aria-hidden
              />
            </>
          )}
          <p className="relative text-sm leading-relaxed tracking-wide text-tinta sm:text-[0.95rem]">{project.tagline}</p>
          <Link
            href={href}
            className="relative inline-flex items-center gap-2 rounded-full bg-lavanda-600 px-7 py-3 text-xs font-bold tracking-[0.18em] text-white uppercase shadow-md transition hover:bg-lavanda-700"
          >
            {cta} <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        {/* Puerta: bisagra en el borde izquierdo. El wrapper anima la entrada
            con scroll; el botón interior se abre con hover/foco/tap. */}
        <motion.div
          initial={reduce ? false : { rotateY: -95 }}
          animate={inView || reduce ? { rotateY: 0 } : { rotateY: -95 }}
          transition={{ type: "spring", stiffness: 60, damping: 14, delay: 0.25 + index * 0.18 }}
          style={{ transformOrigin: "left center" }}
          className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]"
        >
          <button
            type="button"
            aria-expanded={open}
            aria-label={`${project.name}: ${open ? "cerrar" : "abrir"} tarjeta`}
            onClick={() => setOpen((v) => !v)}
            style={{ background: project.color }}
            className={cn(
              "pointer-events-auto absolute inset-0 flex items-center justify-center rounded-[1.75rem] shadow-[var(--shadow-flor)]",
              "transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] [transform-origin:left_center]",
              "group-hover:[transform:rotateY(-105deg)] group-focus-within:[transform:rotateY(-105deg)] group-data-[open]:[transform:rotateY(-105deg)]",
            )}
          >
            <span className="absolute inset-4 rounded-[1.25rem] border border-white/35 [backface-visibility:hidden]" aria-hidden />
            <span className="absolute inset-x-8 top-8 h-[38%] rounded-xl border border-white/20 [backface-visibility:hidden]" aria-hidden />
            <span className="absolute inset-x-8 bottom-8 h-[38%] rounded-xl border border-white/20 [backface-visibility:hidden]" aria-hidden />
            <span className="absolute right-5 top-1/2 size-3 -translate-y-1/2 rounded-full bg-white/80 shadow" aria-hidden />
            {project.logoUrl ? (
              <Image
                src={project.logoUrl}
                alt=""
                width={260}
                height={260}
                className="relative w-3/4 max-w-56 object-contain drop-shadow-sm [backface-visibility:hidden]"
              />
            ) : (
              <span className="relative font-script text-5xl text-white [backface-visibility:hidden]">{project.name}</span>
            )}
          </button>
        </motion.div>
      </div>

      {/* El título aparece después de la tarjeta */}
      <motion.h3
        className="mt-5 text-center font-serif text-2xl text-tinta"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay: 0.9 + index * 0.18 }}
      >
        <Link href={href} className="transition hover:text-vino">
          {project.name}
        </Link>
      </motion.h3>
    </motion.li>
  );
}

export function DoorCards({ projects, cta = "Ver más", className }: { projects: DoorProject[]; cta?: string; className?: string }) {
  return (
    <ul
      className={cn(
        "mx-auto grid max-w-6xl gap-x-8 gap-y-12 sm:grid-cols-2",
        projects.length >= 3 && "lg:grid-cols-3",
        projects.length === 4 && "lg:grid-cols-4 lg:gap-x-6",
        className,
      )}
    >
      {projects.map((p, i) => (
        <DoorCard key={p.slug} project={p} index={i} cta={cta} />
      ))}
    </ul>
  );
}
