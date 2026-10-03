import { Trash2 } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { listMedia } from "@/modules/media/service";
import { deleteMediaAction } from "@/modules/media/actions";
import { MediaUploadForm } from "@/modules/media/components/upload-form";
import { CopyUrlButton } from "@/modules/media/components/copy-url-button";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { formatDate } from "@/shared/lib/utils";

export const metadata = { title: "Medios" };

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default async function MediosPage() {
  await requireRole("ADMIN");
  let files: Awaited<ReturnType<typeof listMedia>> = [];
  let loadError = false;
  try {
    files = await listMedia();
  } catch {
    loadError = true;
  }

  return (
    <>
      <PageHeader
        title="Biblioteca de medios"
        description="Imágenes del sitio. Súbelas una vez y reutilízalas en cualquier sección, página o proyecto."
      />
      <Card className="mb-6">
        <CardHeader title="Subir imágenes" />
        <CardBody>
          <MediaUploadForm />
        </CardBody>
      </Card>

      {loadError ? (
        <Card><EmptyState title="No se pudo leer la biblioteca" description="Revisa que Supabase Storage esté disponible." /></Card>
      ) : files.length === 0 ? (
        <Card><EmptyState title="Aún no hay imágenes" description="Las imágenes que subas aparecerán aquí." /></Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((f) => (
            <li key={f.path} className="overflow-hidden rounded-[var(--radius-card)] border border-borde bg-papel shadow-[var(--shadow-suave)]">
              <a href={f.url} target="_blank" rel="noreferrer" className="block bg-crema">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </a>
              <div className="space-y-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-tinta" title={f.path}>{f.name}</p>
                  <p className="text-xs text-tinta-suave">
                    {formatSize(f.size)}
                    {f.createdAt ? ` · ${formatDate(f.createdAt)}` : ""}
                    {f.path.includes("/") ? ` · ${f.path.split("/")[0]}` : ""}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <CopyUrlButton url={f.url} />
                  <ConfirmAction
                    action={deleteMediaAction}
                    fields={{ path: f.path }}
                    variant="ghost"
                    size="icon"
                    ariaLabel={`Eliminar ${f.name}`}
                    icon={<Trash2 className="size-4" aria-hidden />}
                    title="Eliminar imagen"
                    description="Si la imagen está en uso en el sitio, dejará de mostrarse. Esta acción no se puede deshacer."
                    confirmLabel="Eliminar"
                    confirmVariant="danger"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
