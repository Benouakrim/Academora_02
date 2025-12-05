-- AlterTable
ALTER TABLE "Comparison" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Referral" ADD COLUMN     "rewardAmount" INTEGER NOT NULL DEFAULT 0;
