import "dotenv/config";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const empty = fileURLToPath(new URL("./tests/support/empty.ts", import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths()],
  // `server-only` lanza fuera de React Server Components; en tests es un no-op.
  resolve: { alias: { "server-only": empty } },
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["tests/unit/**/*.test.ts"], environment: "node" },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
          fileParallelism: false,
          testTimeout: 30_000,
        },
      },
    ],
  },
});
