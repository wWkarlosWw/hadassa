"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Heart } from "lucide-react";
import { buttonClasses } from "@/shared/ui/button";
import { FallingPetals } from "./falling-petals";

/**
 * Portada: "un camino con árboles frutales y flores, con pétalos de mirto
 * cayendo". Flores en acuarela con parallax y el sello de Hadassa.
 */
export function Hero({
  eyebrow,
  title,
  subtitle,
  cta,
  ctaHref = "/donar",
  secondaryCta,
  secondaryHref = "/nosotros",
  imageUrl = "/brand/logo.webp",
  imageAlt = "",
  photoMain,
  photoMainAlt = "",
  photoA,
  photoB,
  backgroundUrl,
  scrollLabel,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
  imageUrl?: string;
  imageAlt?: string;
  photoMain?: string;
  photoMainAlt?: string;
  photoA?: string;
  photoB?: string;
  backgroundUrl?: string;
  scrollLabel?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const k = reduce ? 0 : 1;
  const yBranch = useTransform(scrollYProgress, [0, 1], [0, 160 * k]);
  const yFlowerA = useTransform(scrollYProgress, [0, 1], [0, -120 * k]);
  const yFlowerB = useTransform(scrollYProgress, [0, 1], [0, 220 * k]);
  const rotPetal = useTransform(scrollYProgress, [0, 1], [0, 40 * k]);
  const yLogo = useTransform(scrollYProgress, [0, 1], [0, 80 * k]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.2]);
  const yPhotoA = useTransform(scrollYProgress, [0, 1], [0, -90 * k]);
  const yPhotoB = useTransform(scrollYProgress, [0, 1], [0, 140 * k]);
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_#fff_0%,_var(--color-crema)_55%,_var(--color-rosa-50)_100%)] pt-24"
    >
      {/* Fondo: camino de mirtos que se funde con el crema hacia el texto */}
      {backgroundUrl && (
        <motion.div style={{ scale: scaleBg }} className="absolute inset-0 -z-20" aria-hidden>
          <Image src={backgroundUrl} alt="" fill priority sizes="100vw" className="object-cover object-right opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-crema via-crema/85 to-crema/10 max-lg:via-crema/90 max-lg:to-crema/70" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-crema to-transparent" />
        </motion.div>
      )}

      {/* Camino: suaves colinas en la paleta de marca */}
      <svg className="absolute inset-x-0 bottom-0 -z-10 h-[38%] w-full" viewBox="0 0 1440 400" preserveAspectRatio="none" aria-hidden>
        <path d="M0 230C240 170 420 250 720 210s480-90 720-30v220H0z" fill="var(--color-lavanda-50)" />
        <path d="M0 300c260-50 520 10 760-20s460-70 680-20v140H0z" fill="var(--color-rosa-100)" />
        <path d="M560 400c60-90 140-160 160-190 20 30 100 100 160 190z" fill="var(--color-crema)" opacity="0.9" />
      </svg>

      <FallingPetals count={36} />

      <motion.div style={{ y: yBranch }} className="absolute -left-16 -top-16 -z-10 w-48 opacity-90 sm:w-72 lg:w-80" aria-hidden>
        <Image src="/images/branch.webp" alt="" width={700} height={560} priority className="h-auto w-full -scale-x-100 rotate-[200deg]" />
      </motion.div>
      <motion.div style={{ y: yFlowerA }} className="absolute -bottom-10 -left-16 -z-10 w-48 opacity-90 sm:w-72" aria-hidden>
        <Image src="/images/flower-2-lg.webp" alt="" width={520} height={520} className="h-auto w-full" />
      </motion.div>
      <motion.div style={{ y: yFlowerB, rotate: rotPetal }} className="absolute right-[38%] top-28 -z-10 hidden w-24 lg:block" aria-hidden>
        <Image src="/images/flower-1-lg.webp" alt="" width={520} height={520} className="h-auto w-full" />
      </motion.div>
      <motion.div style={{ y: yFlowerA, rotate: rotPetal }} className="absolute -right-12 bottom-6 -z-10 w-44 sm:w-64" aria-hidden>
        <Image src="/images/petal-lg.webp" alt="" width={600} height={600} className="h-auto w-full" />
      </motion.div>

      <motion.div style={{ opacity: fade }} className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-24 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="text-center lg:text-left">
          <p className="eyebrow rule-under inline-block text-malva lg:after:left-0 lg:after:translate-x-0" style={{ animation: "var(--animate-fade-up)" }}>
            {eyebrow}
          </p>
          <h1
            className="mt-6 font-serif text-5xl leading-[1.02] text-tinta sm:text-6xl lg:text-7xl"
            style={{ animation: "var(--animate-fade-up)", animationDelay: "120ms" }}
          >
            {title}
          </h1>
          <p
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-tinta-suave sm:text-lg lg:mx-0"
            style={{ animation: "var(--animate-fade-up)", animationDelay: "240ms" }}
          >
            {subtitle}
          </p>
          <div
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
            style={{ animation: "var(--animate-fade-up)", animationDelay: "360ms" }}
          >
            <Link href={ctaHref || "/donar"} className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
              <Heart className="size-4 fill-current" aria-hidden />
              {cta}
            </Link>
            {secondaryCta && (
              <Link href={secondaryHref || "/nosotros"} className={buttonClasses("outline", "lg", "w-full sm:w-auto")}>
                {secondaryCta} <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
          </div>
        </div>

        {photoMain ? (
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[22rem] sm:max-w-md lg:max-w-none" style={{ animation: "var(--animate-fade-up)", animationDelay: "200ms" }}>
            <div className="absolute inset-0 -z-10 translate-x-6 translate-y-6 rounded-t-full rounded-b-[2.5rem] bg-rosa/40 blur-2xl" aria-hidden />
            {/* Foto principal en forma de arco */}
            <div className="relative h-full w-full overflow-hidden rounded-t-full rounded-b-[2.5rem] border-[6px] border-white shadow-[var(--shadow-flor)]">
              <Image src={photoMain} alt={photoMainAlt} fill priority sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover object-[50%_60%]" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-vino/40 to-transparent" aria-hidden />
            </div>
            {photoA && (
              <motion.div style={{ y: yPhotoA }} className="absolute -left-6 top-[18%] size-28 overflow-hidden rounded-full border-[5px] border-white shadow-[var(--shadow-flor)] sm:-left-12 sm:size-36">
                <Image src={photoA} alt="" fill sizes="160px" className="object-cover" />
              </motion.div>
            )}
            {photoB && (
              <motion.div style={{ y: yPhotoB }} className="absolute -right-4 bottom-[14%] size-24 overflow-hidden rounded-full border-[5px] border-white shadow-[var(--shadow-flor)] sm:-right-10 sm:size-32">
                <Image src={photoB} alt="" fill sizes="140px" className="object-cover" />
              </motion.div>
            )}
            <motion.div style={{ y: yLogo }} className="absolute -bottom-8 left-1/2 w-28 -translate-x-1/2 sm:w-32">
              <Image src={imageUrl || "/brand/logo.webp"} alt={imageAlt} width={256} height={256} className="h-auto w-full drop-shadow-[0_18px_24px_rgba(127,81,83,0.35)]" />
            </motion.div>
          </div>
        ) : (
          <motion.div style={{ y: yLogo }} className="relative mx-auto w-64 sm:w-80 lg:w-full lg:max-w-md">
            <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-rosa/30 blur-3xl" aria-hidden />
            <Image src={imageUrl || "/brand/logo.webp"} alt={imageAlt} width={640} height={640} priority className="h-auto w-full drop-shadow-[0_30px_40px_rgba(127,81,83,0.25)]" />
          </motion.div>
        )}
      </motion.div>

      {scrollLabel && (
      <a
        href="#proyectos"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium tracking-[0.2em] text-tinta-suave uppercase sm:flex"
      >
        {scrollLabel}
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-malva to-transparent" />
      </a>
      )}
    </section>
  );
}
