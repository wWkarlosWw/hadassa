import { CalendarDays, MapPin, Sparkles, Users } from "lucide-react";
import { requireUser } from "@/modules/auth/session";
import { listMyParticipations, listUpcomingEvents } from "@/modules/events/service";
import { CancelParticipationButton, RegisterEventButton } from "@/modules/events/components/participation-buttons";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { ParticipationStatusBadge } from "@/shared/ui/status-badges";
import { formatDate, formatDateTime } from "@/shared/lib/utils";

export const metadata = { title: "Actividades" };

export default async function ActividadesPage() {
  const user = await requireUser();
  const [events, mine] = await Promise.all([listUpcomingEvents(30), listMyParticipations(user.id)]);
  const byEvent = new Map(mine.map((p) => [p.event.id, p]));

  return (
    <>
      <PageHeader title="Actividades" description="Sirve junto a Hadassa como voluntario. Al asistir, sumas puntos." />

      {events.length === 0 ? (
        <Card>
          <EmptyState title="No hay actividades próximas" description="Muy pronto publicaremos nuevas jornadas. ¡Vuelve pronto!" />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((e) => {
            const mineP = byEvent.get(e.id);
            const taken = e._count.participations;
            const full = e.capacity !== null && taken >= e.capacity;
            const color = e.project?.color ?? "#8e9ace";
            return (
              <article key={e.id} className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-borde bg-papel shadow-[var(--shadow-suave)]">
                <div className="h-1.5" style={{ background: color }} aria-hidden />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid w-14 shrink-0 place-items-center rounded-xl py-2 text-center" style={{ background: `${color}22`, color }}>
                      <span className="text-xl leading-none font-bold">{formatDate(e.startsAt, { day: "2-digit" })}</span>
                      <span className="text-[0.65rem] font-semibold uppercase">{formatDate(e.startsAt, { month: "short" })}</span>
                    </span>
                    <Badge tone="rosa">
                      <Sparkles className="size-3" aria-hidden /> +{e.pointsReward} pts
                    </Badge>
                  </div>
                  <h2 className="mt-4 font-serif text-xl">{e.title}</h2>
                  {e.project && <p className="text-xs font-semibold" style={{ color }}>{e.project.name}</p>}
                  {e.description && <p className="mt-2 line-clamp-3 text-sm text-tinta-suave">{e.description}</p>}
                  <dl className="mt-4 space-y-1.5 text-xs text-tinta-suave">
                    <div className="flex items-center gap-2"><CalendarDays className="size-3.5" aria-hidden /> {formatDateTime(e.startsAt)}</div>
                    <div className="flex items-center gap-2"><MapPin className="size-3.5" aria-hidden /> {e.location || "Por confirmar"}</div>
                    <div className="flex items-center gap-2">
                      <Users className="size-3.5" aria-hidden /> {taken} inscritos{e.capacity ? ` de ${e.capacity}` : ""}
                    </div>
                  </dl>
                  <div className="mt-auto pt-5">
                    {mineP && mineP.status !== "CANCELLED" ? (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <ParticipationStatusBadge status={mineP.status} />
                        {mineP.status === "REGISTERED" && <CancelParticipationButton id={mineP.id} title={e.title} />}
                      </div>
                    ) : (
                      <RegisterEventButton eventId={e.id} disabled={full} />
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Card className="mt-8">
        <CardHeader title="Mi historial de participación" />
        {mine.length === 0 ? (
          <EmptyState title="Aún no participas en actividades" />
        ) : (
          <ul className="divide-y divide-borde">
            {mine.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                <div>
                  <p className="font-semibold">{p.event.title}</p>
                  <p className="text-xs text-tinta-suave">{formatDateTime(p.event.startsAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {p.status === "ATTENDED" && <span className="text-sm font-semibold text-exito">+{p.event.pointsReward} pts</span>}
                  <ParticipationStatusBadge status={p.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
