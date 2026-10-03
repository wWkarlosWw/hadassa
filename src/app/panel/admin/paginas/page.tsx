import Link from "next/link";
import { ExternalLink, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { listPages } from "@/modules/pages/service";
import { deletePageAction, togglePagePublishedAction } from "@/modules/pages/actions";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { PageHeader } from "@/shared/ui/page-header";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { LinkButton, buttonClasses } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Table, Td, Th } from "@/shared/ui/table";
import { formatDate } from "@/shared/lib/utils";

export const metadata = { title: "Páginas" };

export default async function PaginasPage() {
  await requireRole("ADMIN");
  const pages = await listPages();

  return (
    <>
      <PageHeader
        title="Páginas"
        description="Crea páginas nuevas para el sitio (transparencia, noticias, convocatorias…) con un editor por bloques."
        actions={
          <LinkButton href="/panel/admin/paginas/nueva">
            <Plus className="size-4" aria-hidden /> Nueva página
          </LinkButton>
        }
      />
      <Card>
        {pages.length === 0 ? (
          <EmptyState
            title="Aún no hay páginas"
            description="Las páginas que crees aparecerán en /su-direccion y, si quieres, en el menú."
            action={<LinkButton href="/panel/admin/paginas/nueva">Crear la primera</LinkButton>}
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Página</Th>
                <Th>Estado</Th>
                <Th>Menú</Th>
                <Th>Actualizada</Th>
                <Th className="text-right">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/panel/admin/paginas/${p.id}`} className="font-semibold text-tinta hover:text-vino">
                      {p.title}
                    </Link>
                    <p className="text-xs text-tinta-suave">/{p.slug} · {p.blocks.length} bloques</p>
                  </Td>
                  <Td>{p.published ? <Badge tone="exito">Publicada</Badge> : <Badge tone="alerta">Borrador</Badge>}</Td>
                  <Td className="text-xs text-tinta-suave">
                    {[p.showInNav && "Principal", p.showInFooter && "Pie"].filter(Boolean).join(" · ") || "—"}
                  </Td>
                  <Td className="text-sm text-tinta-suave">{formatDate(p.updatedAt)}</Td>
                  <Td>
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/${p.slug}${p.published ? "" : "?vista-previa=1"}`}
                        target="_blank"
                        className={buttonClasses("ghost", "icon")}
                        aria-label={`Ver ${p.title}`}
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                      <Link href={`/panel/admin/paginas/${p.id}`} className={buttonClasses("ghost", "icon")} aria-label={`Editar ${p.title}`}>
                        <Pencil className="size-4" />
                      </Link>
                      <ConfirmAction
                        action={togglePagePublishedAction}
                        fields={{ id: p.id, published: String(!p.published) }}
                        icon={p.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        ariaLabel={p.published ? `Despublicar ${p.title}` : `Publicar ${p.title}`}
                        variant="ghost"
                        size="icon"
                        title={p.published ? "¿Despublicar la página?" : "¿Publicar la página?"}
                        description={p.published ? "Dejará de verse en el sitio." : `Quedará visible en /${p.slug}.`}
                        confirmLabel={p.published ? "Despublicar" : "Publicar"}
                      />
                      <ConfirmAction
                        action={deletePageAction}
                        fields={{ id: p.id }}
                        icon={<Trash2 className="size-4 text-error" />}
                        ariaLabel={`Eliminar ${p.title}`}
                        variant="ghost"
                        size="icon"
                        title="¿Eliminar la página?"
                        description="Esta acción no se puede deshacer."
                        confirmLabel="Eliminar"
                        confirmVariant="danger"
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
