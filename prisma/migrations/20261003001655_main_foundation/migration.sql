-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "is_main" BOOLEAN NOT NULL DEFAULT false;

-- Garantiza en la base que solo exista una fundación principal.
CREATE UNIQUE INDEX "projects_single_main_idx" ON "projects" ("is_main") WHERE "is_main";
