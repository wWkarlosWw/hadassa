/**
 * Variables de entorno con fallback a los nombres que inyecta la integración
 * de Supabase en Vercel (Storage → Supabase), para no tener que copiarlas a mano.
 */

/** Pide SSL sin verificar la CA (como libpq), que es lo que necesita Supabase. */
function withLibpqSsl(url: string | undefined) {
  if (!url || !/sslmode=/.test(url) || /uselibpqcompat=/.test(url)) return url;
  return `${url}&uselibpqcompat=true`;
}

export const env = {
  get supabaseUrl() {
    return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL)!;
  },
  get supabaseAnonKey() {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.SUPABASE_ANON_KEY
    )!;
  },
  get supabaseServiceRoleKey() {
    return (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY)!;
  },
  /** Conexión con pooler (runtime). */
  get databaseUrl() {
    return withLibpqSsl(process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL);
  },
  /** Conexión directa (migraciones y seed). */
  get directUrl() {
    return withLibpqSsl(process.env.DIRECT_URL ?? process.env.POSTGRES_URL_NON_POOLING) ?? this.databaseUrl;
  },
};
