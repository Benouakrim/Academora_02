-- AlterTable
ALTER TABLE "MicroContent" 
ADD COLUMN "blockType" TEXT NOT NULL DEFAULT 'rich_text_block',
ADD COLUMN "data" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "MicroContent_blockType_idx" ON "MicroContent"("blockType");

-- Migration notes:
-- This migration adds support for flexible block types in MicroContent
-- Existing records will default to 'rich_text_block' type
-- Old 'category' and 'content' fields are now optional for backward compatibility
