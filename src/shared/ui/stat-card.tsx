import { cn } from "@/shared/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "#E3AAAA",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[var(--radius-card)] border border-borde bg-papel p-5 shadow-[var(--shadow-suave)]", className)}>
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-tinta-suave">{label}</p>
        {icon && (
          <span className="grid size-9 place-items-center rounded-full" style={{ background: `${accent}26`, color: accent }}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 font-serif text-3xl text-tinta tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-tinta-suave">{hint}</p>}
    </div>
  );
}
