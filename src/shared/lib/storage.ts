import "server-only";
import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "./supabase/admin";
import { DomainError } from "./action-result";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
const RECEIPT_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024;

function extension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  return file.type.split("/").pop() ?? "bin";
}

function validate(file: File, types: string[]) {
  if (!types.includes(file.type)) throw new DomainError("Formato de archivo no permitido.");
  if (file.size > MAX_BYTES) throw new DomainError("El archivo supera los 10 MB.");
}

/** `File` no vacío recibido desde un formulario, o null. */
export function fileFrom(formData: FormData, name: string): File | null {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

/** Sube una imagen pública (bucket `media`) y devuelve su URL. */
export async function uploadPublicImage(file: File, folder: string) {
  validate(file, IMAGE_TYPES);
  const supabase = createSupabaseAdminClient();
  const path = `${folder}/${randomUUID()}.${extension(file)}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) throw new DomainError("No se pudo subir la imagen.");
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

/** Sube un comprobante privado (bucket `receipts`) y devuelve su ruta. */
export async function uploadReceipt(file: File, ownerId: string) {
  validate(file, RECEIPT_TYPES);
  const supabase = createSupabaseAdminClient();
  const path = `${ownerId}/${randomUUID()}.${extension(file)}`;
  const { error } = await supabase.storage.from("receipts").upload(path, file, { contentType: file.type });
  if (error) throw new DomainError("No se pudo subir el comprobante.");
  return path;
}

/** URL temporal (10 min) para ver un comprobante privado. */
export async function receiptSignedUrl(path: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.storage.from("receipts").createSignedUrl(path, 600);
  return data?.signedUrl ?? null;
}
