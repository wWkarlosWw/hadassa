"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";

const SOURCES = ["/petals/petal-1.webp", "/petals/petal-2.webp", "/petals/petal-1.webp", "/petals/flower-2.webp", "/petals/flower-1.webp"];

interface Petal {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  sway: number;
  swaySpeed: number;
  img: number;
  alpha: number;
  depth: number;
}

/**
 * Pétalos del árbol de mirto cayendo lentamente. Se apartan del cursor y caen
 * más rápido cuanto más rápido se mueve el mouse. Pausa con la pestaña oculta
 * y respeta `prefers-reduced-motion`.
 */
export function FallingPetals({
  count = 32,
  fixed = false,
  className,
}: {
  count?: number;
  /** `true`: cubre la ventana (fondo de página); `false`: cubre su contenedor. */
  fixed?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 640;
    const total = reduce ? Math.min(8, count) : isSmall ? Math.round(count * 0.55) : count;

    const images = SOURCES.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const spawn = (initial: boolean): Petal => {
      const depth = rand(0.45, 1);
      return {
        x: rand(-20, width + 20),
        y: initial ? rand(-height, height) : rand(-120, -30),
        size: rand(14, 30) * depth,
        vx: rand(-0.15, 0.25),
        vy: rand(0.35, 0.8) * depth,
        rot: rand(0, Math.PI * 2),
        vrot: rand(-0.012, 0.012),
        sway: rand(0, Math.PI * 2),
        swaySpeed: rand(0.008, 0.02),
        img: Math.floor(Math.random() * SOURCES.length),
        alpha: rand(0.55, 0.95) * (0.6 + depth * 0.4),
        depth,
      };
    };
    const petals = Array.from({ length: total }, () => spawn(true));

    // Estado del puntero (coordenadas relativas al canvas) y su velocidad.
    const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, speed: 0, last: 0 };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();
      const dt = Math.max(16, now - pointer.last);
      if (pointer.last) {
        pointer.vx = ((x - pointer.x) / dt) * 16;
        pointer.vy = ((y - pointer.y) / dt) * 16;
        pointer.speed = Math.min(60, Math.hypot(pointer.vx, pointer.vy));
      }
      pointer.x = x;
      pointer.y = y;
      pointer.last = now;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
    };

    let raf = 0;
    let running = true;
    let gust = 0; // agitación global que decae

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      gust = Math.max(gust * 0.96, pointer.speed / 60);
      pointer.speed *= 0.9;

      for (const p of petals) {
        p.sway += p.swaySpeed;
        const fall = p.vy * (1 + gust * 2.2);
        p.x += p.vx + Math.sin(p.sway) * 0.6 * p.depth;
        p.y += fall;
        p.rot += p.vrot * (1 + gust * 3);

        // Empuje del cursor: más fuerte cuanto más rápido se mueve.
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        const radius = 120 + pointer.speed * 2;
        if (dist < radius && dist > 0.1) {
          const force = (1 - dist / radius) * (0.8 + pointer.speed * 0.12);
          p.vx += (dx / dist) * force * 0.35 + pointer.vx * 0.01;
          p.y += (dy / dist) * force * 1.2;
          p.vrot += (Math.random() - 0.5) * 0.01 * force;
        }
        // Fricción para volver a la deriva natural.
        p.vx = p.vx * 0.97 + 0.05 * 0.03;
        p.vrot = Math.max(-0.05, Math.min(0.05, p.vrot * 0.995));

        if (p.y > height + 40 || p.x < -80 || p.x > width + 80) Object.assign(p, spawn(false));

        const img = images[p.img];
        if (!img.complete || img.naturalWidth === 0) continue;
        const ratio = img.naturalHeight / img.naturalWidth;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        // Leve "volteo" 3D simulado con escala horizontal.
        ctx.scale(Math.cos(p.sway * 1.3) * 0.35 + 0.65, 1);
        ctx.drawImage(img, -p.size / 2, (-p.size * ratio) / 2, p.size, p.size * ratio);
        ctx.restore();
      }
      if (running && !reduce) raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      cancelAnimationFrame(raf);
      if (running && !reduce) raf = requestAnimationFrame(draw);
    };

    // Primer pintado cuando cargan las imágenes (útil en modo reducido).
    let loaded = 0;
    images.forEach((img) =>
      img.addEventListener("load", () => {
        loaded++;
        if (reduce && loaded === images.length) draw();
      }),
    );

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    if (!reduce) raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none inset-0 h-full w-full", fixed ? "fixed z-0" : "absolute", className)}
    />
  );
}
