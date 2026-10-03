import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Newspaper, Trash2 } from "lucide-react";
import { buttonClasses } from "@/shared/ui/button";
import { requireRole } from "@/modules/auth/session";
import { listAllProjects } from "@/modules/projects/service";
import { deleteProjectAction } from "@/modules/projects/actions";
import { ProjectDialog } from "@/modules/projects/components/project-dialog";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { ProgressBar } from "@/modules/panel/progress";
import { PageHeader } from "@/shared/ui/page-header";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { formatBs, formatNumber } from "@/shared/lib/utils";

export const metadata = { title: "Proyectos" };

export default async function ProyectosAdminPage() {
  await requireRole("ADMIN");
  const projects = await listAllProjects();

  return (
    <>
      <PageHeader
        title="Proyectos"
        description="Campañas de donación: aparecen como puertas en el inicio y en el explorador de campañas. El orden define cómo se muestran."
        actions={<ProjectDialog />}
      />
      {projects.length === 0 ? (
        <Card><EmptyState title="Aún no hay proyectos" /></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="flex items-start gap-4 p-5">
                <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl" style={{ background: p.color }}>
                  {p.logoUrl && <Image src={p.logoUrl} alt="" width={64} height={64} className="size-14 object-contain" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate font-serif text-xl">{p.name}</h2>
                      <p className="text-xs text-tinta-suave">/proyectos/{p.slug} · orden {p.sortOrder}</p>
                    </div>
                    <div className="flex shrink-0">
                      <ProjectDialog
                        project={{
                          id: p.id, name: p.name, slug: p.slug, tagline: p.tagline, description: p.description, color: p.color,
                          goal: p.goal, beneficiaries: p.beneficiaries, sortOrder: p.sortOrder, featured: p.featured,
                          isActive: p.isActive, logoUrl: p.logoUrl, coverUrl: p.coverUrl,
                          category: p.category, location: p.location, story: p.story, endsAt: p.endsAt,
                          acceptsDonations: p.acceptsDonations,
                        }}
                      />
                      <ConfirmAction
                        action={deleteProjectAction}
                        fields={{ id: p.id }}
                        variant="ghost"
                        size="icon"
                        ariaLabel={`Eliminar ${p.name}`}
                        icon={<Trash2 className="size-4" aria-hidden />}
                        title={`Eliminar ${p.name}`}
                        description="Si ya tiene donaciones registradas, solo se ocultará del sitio para conservar el historial."
                        confirmLabel="Eliminar"
                        confirmVariant="danger"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.isActive ? <Badge tone="exito">Visible</Badge> : <Badge>Oculto</Badge>}
                    {p.featured && <Badge tone="rosa">Destacado</Badge>}
                    <Badge tone="lavanda">{formatNumber(p._count.events)} actividades</Badge>
                    {p.category && <Badge>{p.category}</Badge>}
                    {!p.acceptsDonations && <Badge tone="alerta">No recibe donaciones</Badge>}
                    <Badge tone="vino">{formatNumber(p.donationsCount)} donaciones</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/panel/admin/proyectos/${p.id}/novedades`} className={buttonClasses("outline", "sm")}>
                      <Newspaper className="size-4" aria-hidden /> Novedades ({p._count.updates})
                    </Link>
                    <Link href={`/proyectos/${p.slug}`} target="_blank" className={buttonClasses("ghost", "sm")}>
                      <ExternalLink className="size-4" aria-hidden /> Ver campaña
                    </Link>
                  </div>
                </div>
              </div>
              <div className="border-t border-borde px-5 py-4">
                <div className="mb-1.5 flex justify-between text-xs text-tinta-suave">
                  <span>Recaudado {formatBs(p.raised)}</span>
                  <span>{p.goal ? `Meta ${formatBs(p.goal)}` : "Sin meta"}</span>
                </div>
                <ProgressBar value={p.goal ? p.raised / p.goal : 0} color={p.color} label={`Progreso de ${p.name}`} />
                {p.tagline && <p className="mt-3 line-clamp-2 text-sm text-tinta-suave">{p.tagline}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
