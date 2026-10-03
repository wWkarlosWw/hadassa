import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/shared/lib/env";

/**
 * Cliente con service role: crea usuarios y sube archivos a Storage.
 * Solo se usa en el servidor, nunca se expone al navegador.
 */
export function createSupabaseAdminClient() {
  return createClient(
    env.supabaseUrl,
    env.supabaseServiceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
