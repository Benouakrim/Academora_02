-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountType" TEXT,
ADD COLUMN     "focusArea" TEXT,
ADD COLUMN     "onboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingAnswers" JSONB,
ADD COLUMN     "organizationName" TEXT,
ADD COLUMN     "personaRole" TEXT,
ADD COLUMN     "primaryGoal" TEXT;
