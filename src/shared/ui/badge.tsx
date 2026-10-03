import { cn } from "@/shared/lib/utils";

const tones = {
  neutral: "bg-crema text-tinta-suave ring-borde",
  rosa: "bg-rosa-50 text-rosa-700 ring-rosa-200",
  lavanda: "bg-lavanda-50 text-lavanda-700 ring-lavanda-100",
  vino: "bg-vino-50 text-vino ring-vino/20",
  exito: "bg-exito-50 text-exito ring-exito/20",
  alerta: "bg-alerta-50 text-alerta ring-alerta/20",
  error: "bg-error-50 text-error ring-error/20",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ tone = "neutral", className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", tones[tone], className)}
      {...props}
    />
  );
}
