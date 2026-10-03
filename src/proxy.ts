import type { NextRequest } from "next/server";
import { updateSession } from "@/shared/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Todo excepto archivos estáticos e imágenes.
    "/((?!_next/static|_next/image|favicon.ico|icon.png|brand/|images/|petals/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
