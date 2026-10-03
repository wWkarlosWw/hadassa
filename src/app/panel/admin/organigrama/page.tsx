import { Trash2 } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { listOrgAreas } from "@/modules/cms/service";
import { deleteOrgAreaAction } from "@/modules/cms/actions";
import { OrgAreaDialog } from "@/modules/cms/components/value-dialog";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { OrgIcon } from "@/modules/panel/org-icons";
import { PageHeader } from "@/shared/ui/page-header";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";

export const metadata = { title: "Organigrama" };

export default async function OrganigramaAdminPage() {
  await requireRole("ADMIN");
  const areas = await listOrgAreas();
  const nextOrder = areas.length ? Math.max(...areas.map((a) => a.sortOrder)) + 1 : 0;

  return (
    <>
      <PageHeader
        title="Organigrama"
        description="Solo las áreas (sin personas). Se dibujan alrededor del sello de Hadassa en la página Nosotros."
        actions={<OrgAreaDialog nextOrder={nextOrder} />}
      />
      <Card>
        {areas.length === 0 ? (
          <EmptyState title="Aún no hay áreas" />
        ) : (
          <ul className="divide-y divide-borde">
            {areas.map((a) => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                <span className="grid size-12 shrink-0 place-items-center rounded-full text-white" style={{ background: a.color }}>
                  <OrgIcon name={a.icon} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{a.name}</p>
                  {a.description && <p className="text-sm text-tinta-suave">{a.description}</p>}
                </div>
                <span className="hidden text-xs text-tinta-suave sm:block">Orden {a.sortOrder}</span>
                <div className="flex shrink-0">
                  <OrgAreaDialog area={{ id: a.id, name: a.name, description: a.description, icon: a.icon, color: a.color, sortOrder: a.sortOrder }} />
                  <ConfirmAction
                    action={deleteOrgAreaAction}
                    fields={{ id: a.id }}
                    variant="ghost"
                    size="icon"
                    ariaLabel={`Eliminar ${a.name}`}
                    icon={<Trash2 className="size-4" aria-hidden />}
                    title={`Eliminar “${a.name}”`}
                    confirmLabel="Eliminar"
                    confirmVariant="danger"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
