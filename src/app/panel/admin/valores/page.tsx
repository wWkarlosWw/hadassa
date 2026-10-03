import { Trash2 } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { listCoreValues } from "@/modules/cms/service";
import { deleteCoreValueAction } from "@/modules/cms/actions";
import { CoreValueDialog } from "@/modules/cms/components/value-dialog";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { PageHeader } from "@/shared/ui/page-header";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";

export const metadata = { title: "Valores" };

export default async function ValoresPage() {
  await requireRole("ADMIN");
  const values = await listCoreValues(true);
  const nextOrder = values.length ? Math.max(...values.map((v) => v.sortOrder)) + 1 : 0;

  return (
    <>
      <PageHeader
        title="Valores"
        description="Se muestran como frutos colgando del árbol de mirto en la página Nosotros."
        actions={<CoreValueDialog nextOrder={nextOrder} />}
      />
      {values.length === 0 ? (
        <Card><EmptyState title="Aún no hay valores" /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {values.map((v) => (
            <article key={v.id} className={`relative flex flex-col items-center rounded-[var(--radius-card)] border border-borde bg-papel p-6 text-center shadow-[var(--shadow-suave)] ${v.isActive ? "" : "opacity-60"}`}>
              <div className="absolute top-3 right-3 flex">
                <CoreValueDialog value={{ id: v.id, title: v.title, description: v.description, sortOrder: v.sortOrder, isActive: v.isActive }} />
                <ConfirmAction
                  action={deleteCoreValueAction}
                  fields={{ id: v.id }}
                  variant="ghost"
                  size="icon"
                  ariaLabel={`Eliminar ${v.title}`}
                  icon={<Trash2 className="size-4" aria-hidden />}
                  title={`Eliminar “${v.title}”`}
                  confirmLabel="Eliminar"
                  confirmVariant="danger"
                />
              </div>
              <span className="grid size-28 place-items-center rounded-full bg-rosa px-4 text-white shadow-[var(--shadow-flor)]">
                <span className="font-script text-2xl leading-tight">{v.title}</span>
              </span>
              <p className="mt-4 text-sm text-tinta-suave">{v.description}</p>
              <div className="mt-3 flex gap-2">
                <Badge>Orden {v.sortOrder}</Badge>
                {!v.isActive && <Badge tone="alerta">Oculto</Badge>}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
