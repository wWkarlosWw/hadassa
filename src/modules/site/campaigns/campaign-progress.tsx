import { formatBs } from "@/shared/lib/utils";
import { progressPercent } from "@/modules/projects/campaign";

/** Barra de progreso compacta de una campaña (recaudado / meta / %). */
export function CampaignProgress({
  raised,
  goal,
  color,
  raisedLabel,
  goalLabel,
  size = "md",
}: {
  raised: number;
  goal: number | null;
  color: string;
  raisedLabel: string;
  goalLabel: string;
  size?: "md" | "lg";
}) {
  const pct = progressPercent(raised, goal);
  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span className={size === "lg" ? "font-serif text-3xl text-tinta" : "font-serif text-xl text-tinta"}>{formatBs(raised)}</span>
        <span className="text-sm text-tinta-suave">
          {raisedLabel}
          {goal ? ` · ${goalLabel} ${formatBs(goal)}` : ""}
        </span>
      </p>
      {goal ? (
        <div
          className={`mt-2.5 overflow-hidden rounded-full bg-borde ${size === "lg" ? "h-3" : "h-2"}`}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% de la meta`}
        >
          <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${Math.max(pct, 2)}%`, background: color }} />
        </div>
      ) : null}
    </div>
  );
}
