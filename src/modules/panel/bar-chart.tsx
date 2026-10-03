import { formatBs } from "@/shared/lib/utils";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Gráfico de barras accesible (CSS) de recaudación mensual. */
export function MonthlyBarChart({ data }: { data: { month: string; total: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <figure>
      <div className="flex h-48 items-end gap-2 sm:gap-4" role="list" aria-label="Recaudación por mes">
        {data.map((d) => {
          const [y, m] = d.month.split("-");
          const label = `${MONTHS[Number(m) - 1]} ${y.slice(2)}`;
          const pct = (d.total / max) * 100;
          return (
            <div key={d.month} role="listitem" className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-[0.68rem] font-semibold text-tinta-suave tabular-nums opacity-0 transition group-hover:opacity-100 sm:opacity-100">
                {d.total > 0 ? formatBs(d.total) : ""}
              </span>
              <div
                className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-rosa-500 to-rosa transition-[height] duration-700"
                style={{ height: `${Math.max(pct, d.total > 0 ? 3 : 1)}%` }}
                aria-label={`${label}: ${formatBs(d.total)}`}
              />
              <span className="text-xs text-tinta-suave capitalize">{label}</span>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
