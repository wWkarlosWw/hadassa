import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { getProjectById, listProjectUpdates } from "@/modules/projects/service";
import { deleteProjectUpdateAction } from "@/modules/projects/actions";
import { UpdateDialog } from "@/modules/projects/components/update-dialog";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { PageHeader } from "@/shared/ui/page-header";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { buttonClasses } from "@/shared/ui/button";
import { formatDate } from "@/shared/lib/utils";

export const metadata = { title: "Novedades de la campaña" };

export default async function NovedadesPage(props: PageProps<"/panel/admin/proyectos/[id]/novedades">) {
  await requireRole("ADMIN");
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const project = await getProjectById(id);
  if (!project) notFound();
  const updates = await listProjectUpdates(id);

  return (
    <>
      <Link href="/panel/admin/proyectos" className="mb-4 inline-flex items-center gap-2 text-sm text-tinta-suave hover:text-tinta">
        <ArrowLeft className="size-4" aria-hidden /> Proyectos
      </Link>
      <PageHeader
        title={`Novedades · ${project.name}`}
        description="Publica avances de la campaña. Aparecen como línea de tiempo en la ficha pública."
        actions={
          <>
            <Link href={`/proyectos/${project.slug}`} target="_blank" className={buttonClasses("outline", "md")}>
              <ExternalLink className="size-4" aria-hidden /> Ver campaña
            </Link>
            <UpdateDialog projectId={project.id} />
          </>
        }
      />
      {updates.length === 0 ? (
        <Card>
          <EmptyState title="Aún no hay novedades" description="Cuéntales a los donantes qué se logró con su apoyo." />
        </Card>
      ) : (
        <ul className="space-y-4">
          {updates.map((u) => (
            <li key={u.id}>
              <Card className="flex flex-col gap-4 p-5 sm:flex-row">
                {u.imageUrl && (
                  <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl sm:w-48">
                    <Image src={u.imageUrl} alt="" fill sizes="200px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-tinta-suave">
                        {formatDate(u.createdAt, { dateStyle: "long" })}
                        {u.author ? ` · ${u.author.fullName}` : ""}
                      </p>
                      <h2 className="mt-1 font-serif text-xl">{u.title}</h2>
                    </div>
                    <div className="flex shrink-0">
                      <UpdateDialog projectId={project.id} update={{ id: u.id, title: u.title, body: u.body, imageUrl: u.imageUrl }} />
                      <ConfirmAction
                        action={deleteProjectUpdateAction}
                        fields={{ id: u.id }}
                        variant="ghost"
                        size="icon"
                        ariaLabel={`Eliminar ${u.title}`}
                        icon={<Trash2 className="size-4" aria-hidden />}
                        title="Eliminar novedad"
                        description="Se quitará de la ficha pública de la campaña."
                        confirmLabel="Eliminar"
                        confirmVariant="danger"
                      />
                    </div>
                  </div>
                  {u.body && <p className="mt-2 line-clamp-3 text-sm whitespace-pre-line text-tinta-suave">{u.body}</p>}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
