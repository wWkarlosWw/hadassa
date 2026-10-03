import { CalendarCheck2, ClipboardCheck, Users } from "lucide-react";
import type { SessionUser } from "@/modules/auth/session";
import { donationStats } from "@/modules/donations/service";
import { listValidatableEvents } from "@/modules/events/service";
import { Card, CardHeader } from "@/shared/ui/card";
import { LinkButton } from "@/shared/ui/button";
import { StatCard } from "@/shared/ui/stat-card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Badge } from "@/shared/ui/badge";
import { formatDateTime, formatNumber } from "@/shared/lib/utils";
import { isPast } from "../dates";

export async function SupervisorDashboard({ user }: { user: SessionUser }) {
  const [stats, events] = await Promise.all([donationStats(), listValidatableEvents(user)]);
  const active = events.filter((e) => !isPast(e.startsAt, 7 * 86_400_000));
  const toValidate = events.reduce((n, e) => n + e.participations.filter((p) => p.status === "REGISTERED").length, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-lavanda-700">Supervisión</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Hola, {user.fullName.split(" ")[0]}</h1>
        <p className="mt-1.5 text-sm text-tinta-suave">Valida donaciones y asistencias para que cada esfuerzo sume.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Donaciones pendientes" value={formatNumber(stats.pendingCount)} icon={<ClipboardCheck className="size-4" />} accent="#b7791f" />
        <StatCard label="Actividades asignadas" value={formatNumber(events.length)} icon={<CalendarCheck2 className="size-4" />} accent="#5f6aa8" />
        <StatCard label="Asistencias por validar" value={formatNumber(toValidate)} icon={<Users className="size-4" />} accent="#7f5153" />
      </div>

      <div className="flex flex-wrap gap-2">
        <LinkButton href="/panel/validar-donaciones">
          <ClipboardCheck className="size-4" aria-hidden /> Validar donaciones
        </LinkButton>
        <LinkButton href="/panel/asistencia" variant="outline">
          <CalendarCheck2 className="size-4" aria-hidden /> Registrar asistencia
        </LinkButton>
      </div>

      <Card>
        <CardHeader title="Mis actividades" description="Actividades en las que estás asignado como supervisor." />
        {active.length === 0 ? (
          <EmptyState title="Sin actividades próximas" description="Cuando la administración te asigne una actividad aparecerá aquí." />
        ) : (
          <ul className="divide-y divide-borde">
            {active.map((e) => {
              const registered = e.participations.filter((p) => p.status === "REGISTERED").length;
              const attended = e.participations.filter((p) => p.status === "ATTENDED").length;
              return (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  <div>
                    <p className="font-semibold">{e.title}</p>
                    <p className="text-xs text-tinta-suave">{formatDateTime(e.startsAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge tone="lavanda">{registered} inscritos</Badge>
                    <Badge tone="exito">{attended} asistieron</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
