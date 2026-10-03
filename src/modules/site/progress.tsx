import { formatBs } from "@/shared/lib/utils";

export interface GoalLabels {
  raised: string;
  goal: string;
  percent: string;
}

const DEFAULT_LABELS: GoalLabels = { raised: "recaudados", goal: "Meta", percent: "de la meta" };

export function GoalProgress({
  raised,
  goal,
  color,
  labels = DEFAULT_LABELS,
}: {
  raised: number;
  goal: number | null;
  color: string;
  labels?: GoalLabels;
}) {
  if (!goal) return null;
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  return (
    <div>
      <div className="flex items-end justify-between gap-4 text-sm">
        <p>
          <span className="font-serif text-2xl text-tinta">{formatBs(raised)}</span>
          <span className="text-tinta-suave"> {labels.raised}</span>
        </p>
        <p className="text-tinta-suave">
          {labels.goal} {formatBs(goal)}
        </p>
      </div>
      <div
        className="mt-3 h-3 overflow-hidden rounded-full bg-borde"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${labels.goal}: ${pct}%`}
      >
        <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="mt-2 text-xs font-medium text-tinta-suave">{pct}% {labels.percent}
      </p>
    </div>
  );
}
