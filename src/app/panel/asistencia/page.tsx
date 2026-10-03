import { CalendarDays, MapPin } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { listValidatableEvents } from "@/modules/events/service";
import { MarkAttendanceButton } from "@/modules/events/components/participation-buttons";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { ParticipationStatusBadge } from "@/shared/ui/status-badges";
import { formatDateTime } from "@/shared/lib/utils";

export const metadata = { title: "Asistencia" };

export default async function AsistenciaPage() {
  const user = await requireRole("SUPERVISOR", "ADMIN");
  const events = await listValidatableEvents(user);

  return (
    <>
      <PageHeader
        title="Registrar asistencia"
        description={
          user.role === "ADMIN"
            ? "Como administrador puedes validar la asistencia de cualquier actividad."
            : "Actividades en las que estás asignado como supervisor."
        }
      />
      {events.length === 0 ? (
        <Card>
          <EmptyState title="Sin actividades asignadas" description="Cuando te asignen una actividad podrás validar la asistencia aquí." />
        </Card>
      ) : (
        <div className="space-y-6">
          {events.map((e) => {
            const pending = e.participations.filter((p) => p.status === "REGISTERED").length;
            return (
              <Card key={e.id}>
                <CardHeader
                  title={e.title}
                  description={
                    <span className="flex flex-wrap gap-x-4 gap-y-1">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden /> {formatDateTime(e.startsAt)}</span>
                      {e.location && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden /> {e.location}</span>}
                    </span>
                  }
                  action={
                    <div className="flex gap-2">
                      {!e.isActive && <Badge>Inactiva</Badge>}
                      <Badge tone={pending ? "alerta" : "exito"}>{pending ? `${pending} por validar` : "Al día"}</Badge>
                    </div>
                  }
                />
                {e.participations.length === 0 ? (
                  <p className="px-6 py-5 text-sm text-tinta-suave">Aún no hay inscritos.</p>
                ) : (
                  <ul className="divide-y divide-borde">
                    {e.participations.map((p) => (
                      <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6">
                        <div className="min-w-0">
                          <p className="font-semibold">{p.profile.fullName}</p>
                          <p className="truncate text-xs text-tinta-suave">{p.profile.email}</p>
                        </div>
                        {p.status === "REGISTERED" ? (
                          <MarkAttendanceButton id={p.id} name={p.profile.fullName} points={e.pointsReward} />
                        ) : (
                          <span className="flex items-center gap-2">
                            {p.status === "ATTENDED" && <span className="text-xs font-semibold text-exito">+{e.pointsReward} pts</span>}
                            <ParticipationStatusBadge status={p.status} />
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
