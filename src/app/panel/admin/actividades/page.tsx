import { Trash2 } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { listAllEvents } from "@/modules/events/service";
import { listAllProjects } from "@/modules/projects/service";
import { listStaff } from "@/modules/users/service";
import { deleteEventAction } from "@/modules/events/actions";
import { EventDialog } from "@/modules/events/components/event-dialog";
import { SupervisorsDialog } from "@/modules/events/components/supervisors-dialog";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { isPast, toLocalInput } from "@/modules/panel/dates";
import { PageHeader } from "@/shared/ui/page-header";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { Table, Td, Th } from "@/shared/ui/table";
import { formatDateTime } from "@/shared/lib/utils";

export const metadata = { title: "Gestionar actividades" };

export default async function ActividadesAdminPage() {
  await requireRole("ADMIN");
  const [events, projects, staff] = await Promise.all([listAllEvents(), listAllProjects(), listStaff()]);
  const projectOptions = projects.map((p) => ({ id: p.id, name: p.name }));

  return (
    <>
      <PageHeader
        title="Actividades"
        description="Crea jornadas de voluntariado, define los puntos por asistir y asigna supervisores."
        actions={<EventDialog projects={projectOptions} />}
      />
      <Card>
        {events.length === 0 ? (
          <EmptyState title="Aún no hay actividades" />
        ) : (
          <Table className="min-w-[820px]">
            <thead>
              <tr>
                <Th>Actividad</Th>
                <Th>Fecha</Th>
                <Th>Inscritos</Th>
                <Th>Supervisores</Th>
                <Th>Estado</Th>
                <Th className="text-right">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const past = isPast(e.startsAt);
                return (
                  <tr key={e.id}>
                    <Td>
                      <p className="font-semibold">{e.title}</p>
                      <p className="text-xs text-tinta-suave">
                        {e.project ? (
                          <span style={{ color: e.project.color }} className="font-semibold">{e.project.name}</span>
                        ) : "Sin proyecto"}
                        {e.location ? ` · ${e.location}` : ""} · +{e.pointsReward} pts
                      </p>
                    </Td>
                    <Td className="whitespace-nowrap text-tinta-suave">{formatDateTime(e.startsAt)}</Td>
                    <Td className="tabular-nums">
                      {e._count.participations}
                      {e.capacity ? ` / ${e.capacity}` : ""}
                    </Td>
                    <Td className="text-xs text-tinta-suave">
                      {e.supervisors.length ? e.supervisors.map((s) => s.profile.fullName).join(", ") : "—"}
                    </Td>
                    <Td>
                      {!e.isActive ? <Badge>Inactiva</Badge> : past ? <Badge tone="neutral">Realizada</Badge> : <Badge tone="exito">Publicada</Badge>}
                    </Td>
                    <Td>
                      <div className="flex justify-end">
                        <SupervisorsDialog
                          eventId={e.id}
                          eventTitle={e.title}
                          assigned={e.supervisors.map((s) => ({ id: s.id, profile: s.profile }))}
                          staff={staff}
                        />
                        <EventDialog
                          projects={projectOptions}
                          event={{
                            id: e.id, title: e.title, description: e.description, location: e.location,
                            startsAt: toLocalInput(e.startsAt), endsAt: toLocalInput(e.endsAt), capacity: e.capacity,
                            pointsReward: e.pointsReward, projectId: e.projectId, isActive: e.isActive, imageUrl: e.imageUrl,
                          }}
                        />
                        <ConfirmAction
                          action={deleteEventAction}
                          fields={{ id: e.id }}
                          variant="ghost"
                          size="icon"
                          ariaLabel={`Eliminar ${e.title}`}
                          icon={<Trash2 className="size-4" aria-hidden />}
                          title="Eliminar actividad"
                          description="Si ya tiene asistencias registradas, se desactivará para conservar el historial de puntos."
                          confirmLabel="Eliminar"
                          confirmVariant="danger"
                        />
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
