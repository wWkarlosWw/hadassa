"use client";

import { motion, useReducedMotion } from "motion/react";

/** Aparece suavemente al entrar en pantalla. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  pop = false,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Efecto "pop up" con rebote (Casa de Fruto). */
  pop?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={pop ? { opacity: 0, scale: 0.6, y: 20 } : { opacity: 0, y }}
      whileInView={pop ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={
        pop
          ? { type: "spring", stiffness: 260, damping: 16, delay }
          : { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }
      }
    >
      {children}
    </motion.div>
  );
}
