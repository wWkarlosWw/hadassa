import Link from "next/link";
import { CalendarDays, MapPin, Sparkles, Users } from "lucide-react";
import { formatDate } from "@/shared/lib/utils";
import { fillTemplate } from "@/modules/cms/definitions";

export interface EventCardLabels {
  registerCta: string;
  spotsOpen: string;
  spotsLeft: string;
  spotsNone: string;
  pointsLabel: string;
}

export interface PublicEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: Date;
  capacity: number | null;
  pointsReward: number;
  project: { name: string; color: string } | null;
  _count: { participations: number };
}

export function EventCard({ event, labels }: { event: PublicEvent; labels: EventCardLabels }) {
  const color = event.project?.color ?? "#8e9ace";
  const left = event.capacity ? Math.max(0, event.capacity - event._count.participations) : null;
  const date = new Date(event.startsAt);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-borde bg-papel shadow-[var(--shadow-suave)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-flor)]">
      <div className="flex items-stretch">
        <div className="flex w-20 shrink-0 flex-col items-center justify-center py-4 text-white" style={{ background: color }}>
          <span className="font-serif text-3xl leading-none drop-shadow-sm">{formatDate(date, { day: "2-digit" })}</span>
          <span className="eyebrow mt-1 text-[0.65rem] drop-shadow-sm">{formatDate(date, { month: "short" }).replace(".", "")}</span>
        </div>
        <div className="min-w-0 flex-1 p-5">
          {event.project && (
            <p className="eyebrow text-[0.65rem]" style={{ color }}>
              {event.project.name}
            </p>
          )}
          <h3 className="mt-1 font-serif text-xl leading-snug text-tinta">{event.title}</h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-5 pb-5">
        {event.description && <p className="line-clamp-3 text-sm leading-relaxed text-tinta-suave">{event.description}</p>}
        <ul className="mt-auto space-y-1.5 text-sm text-tinta-suave">
          <li className="flex items-center gap-2">
            <CalendarDays className="size-4 text-malva" aria-hidden />
            {formatDate(date, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
          </li>
          {event.location && (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-malva" aria-hidden />
              {event.location}
            </li>
          )}
          <li className="flex items-center gap-2">
            <Users className="size-4 text-malva" aria-hidden />
            {left === null ? labels.spotsOpen : left > 0 ? fillTemplate(labels.spotsLeft, { n: left }) : labels.spotsNone}
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="size-4 text-malva" aria-hidden />
            {fillTemplate(labels.pointsLabel, { n: event.pointsReward })}
          </li>
        </ul>
        <Link
          href="/panel/actividades"
          aria-disabled={left === 0}
          className="inline-flex items-center justify-center rounded-full border border-borde px-4 py-2.5 text-sm font-semibold text-tinta transition hover:border-lavanda hover:bg-lavanda-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          {labels.registerCta}
        </Link>
      </div>
    </article>
  );
}
