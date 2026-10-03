import "server-only";
import { fileFrom, uploadPublicImage } from "@/shared/lib/storage";

/** FormData → objeto plano (ignora archivos). */
export function formObject(formData: FormData) {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string") out[k] = v;
  return out;
}

/** "2026-10-09T10:00" (datetime-local) → ISO interpretado en hora de Bolivia (UTC-4). */
export function laPazDateTime(value: string | undefined) {
  if (!value) return value;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00-04:00`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T23:59:59-04:00`;
  return value;
}

/** Imagen de un campo `ImageInput`: sube el archivo nuevo o conserva la URL. */
export async function resolveImage(formData: FormData, name: string, folder: string) {
  const file = fileFrom(formData, `${name}File`);
  if (file) return uploadPublicImage(file, folder);
  const url = formData.get(name);
  return typeof url === "string" ? url.trim() : "";
}
