import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

/** Cierra la sesión desde un redirect (p. ej. cuenta desactivada). */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const url = new URL("/ingresar", request.url);
  const motivo = request.nextUrl.searchParams.get("motivo");
  if (motivo) url.searchParams.set("motivo", motivo);
  return NextResponse.redirect(url);
}
