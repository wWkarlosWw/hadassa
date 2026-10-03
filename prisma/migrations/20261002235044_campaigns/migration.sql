-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_recurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "message_hidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "accepts_donations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "ends_at" TIMESTAMP(3),
ADD COLUMN     "location" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "story" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "project_updates" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "image_url" TEXT,
    "author_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_updates_project_id_created_at_idx" ON "project_updates"("project_id", "created_at");

-- CreateIndex
CREATE INDEX "donations_project_id_status_idx" ON "donations"("project_id", "status");

-- AddForeignKey
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Igual que el resto de tablas: sin acceso directo vía PostgREST.
ALTER TABLE "project_updates" ENABLE ROW LEVEL SECURITY;
