import "dotenv/config";
import { defineConfig } from "prisma/config";

// El CLI (migraciones, seed, studio) usa la conexión directa. En Supabase cloud
// DATABASE_URL apunta al pooler (puerto 6543) y DIRECT_URL al puerto 5432.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
