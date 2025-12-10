-- Add NEEDS_REVISION to ArticleStatus enum
ALTER TYPE "ArticleStatus" ADD VALUE 'NEEDS_REVISION';

-- Add rejection tracking and deletion scheduling to Article table
ALTER TABLE "Article" ADD COLUMN "rejectionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Article" ADD COLUMN "scheduledForDeletion" TIMESTAMP(3);
