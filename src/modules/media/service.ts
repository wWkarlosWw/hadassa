import "server-only";
import { createSupabaseAdminClient } from "@/shared/lib/supabase/admin";
import { DomainError } from "@/shared/lib/action-result";
import { uploadPublicImage } from "@/shared/lib/storage";

export interface MediaFile {
  path: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string | null;
}

const BUCKET = "media";
const MAX_DEPTH = 4;

/** Lista recursivamente los archivos del bucket público `media`. */
export async function listMedia(): Promise<MediaFile[]> {
  const supabase = createSupabaseAdminClient();
  const files: MediaFile[] = [];

  async function walk(prefix: string, depth: number) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit: 1000,
      sortBy: { column: "created_at", order: "desc" },
    });
    if (error) throw new DomainError("No se pudo leer la biblioteca de medios.");
    for (const entry of data ?? []) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) {
        if (depth < MAX_DEPTH) await walk(path, depth + 1);
        continue;
      }
      if (entry.name === ".emptyFolderPlaceholder") continue;
      const meta = (entry.metadata ?? {}) as { size?: number; mimetype?: string };
      files.push({
        path,
        name: entry.name,
        url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
        size: meta.size ?? 0,
        mimeType: meta.mimetype ?? "",
        createdAt: entry.created_at ?? null,
      });
    }
  }

  await walk("", 0);
  return files.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

export async function uploadMedia(files: File[]) {
  const urls: string[] = [];
  for (const file of files) urls.push(await uploadPublicImage(file, "biblioteca"));
  return urls;
}

export async function deleteMedia(path: string) {
  if (!path || path.includes("..")) throw new DomainError("Ruta inválida.");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new DomainError("No se pudo eliminar el archivo.");
}
