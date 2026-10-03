import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service role: crea usuarios y sube archivos a Storage.
 * Solo se usa en el servidor, nunca se expone al navegador.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
