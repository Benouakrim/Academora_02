-- AlterTable
ALTER TABLE "University" ADD COLUMN     "ROIPercentage" DOUBLE PRECISION,
ADD COLUMN     "alumniEarnings10Years" INTEGER,
ADD COLUMN     "alumniEarnings5Years" INTEGER,
ADD COLUMN     "averageSalaryByMajor" JSONB,
ADD COLUMN     "citationIndex" INTEGER,
ADD COLUMN     "fundedResearch" INTEGER,
ADD COLUMN     "geographicDiversityScore" DOUBLE PRECISION,
ADD COLUMN     "industryPartnerships" TEXT[],
ADD COLUMN     "internshipPlacementRate" DOUBLE PRECISION,
ADD COLUMN     "partnerCompaniesCount" INTEGER,
ADD COLUMN     "researchOutputScore" DOUBLE PRECISION,
ADD COLUMN     "studentSatisfactionScore" DOUBLE PRECISION,
ADD COLUMN     "timeToEmploymentMonths" INTEGER;

-- CreateTable
CREATE TABLE "UniversityMetricHistory" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "ranking" INTEGER,
    "acceptanceRate" DOUBLE PRECISION,
    "tuitionCost" INTEGER,
    "employmentRate" DOUBLE PRECISION,
    "averageSalary" INTEGER,
    "studentCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniversityMetricHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisWeights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ranking" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "acceptance" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "employmentRate" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "studentSatisfaction" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "research" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "targetSalary" INTEGER,
    "careerFocus" TEXT,
    "preferredLocation" TEXT,
    "internshipImportant" BOOLEAN NOT NULL DEFAULT false,
    "researchImportant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisWeights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComparisonRiskAssessment" (
    "id" TEXT NOT NULL,
    "comparisonId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "riskFactors" JSONB NOT NULL,
    "overallRiskScore" DOUBLE PRECISION NOT NULL,
    "recommendations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComparisonRiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComparisonInsight" (
    "id" TEXT NOT NULL,
    "comparisonId" TEXT NOT NULL,
    "insight" TEXT NOT NULL,
    "insightType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComparisonInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UniversityMetricHistory_universityId_idx" ON "UniversityMetricHistory"("universityId");

-- CreateIndex
CREATE INDEX "UniversityMetricHistory_year_idx" ON "UniversityMetricHistory"("year");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityMetricHistory_universityId_year_key" ON "UniversityMetricHistory"("universityId", "year");

-- CreateIndex
CREATE INDEX "AnalysisWeights_userId_idx" ON "AnalysisWeights"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisWeights_userId_key" ON "AnalysisWeights"("userId");

-- CreateIndex
CREATE INDEX "ComparisonRiskAssessment_comparisonId_idx" ON "ComparisonRiskAssessment"("comparisonId");

-- CreateIndex
CREATE INDEX "ComparisonRiskAssessment_universityId_idx" ON "ComparisonRiskAssessment"("universityId");

-- CreateIndex
CREATE UNIQUE INDEX "ComparisonRiskAssessment_comparisonId_universityId_key" ON "ComparisonRiskAssessment"("comparisonId", "universityId");

-- CreateIndex
CREATE INDEX "ComparisonInsight_comparisonId_idx" ON "ComparisonInsight"("comparisonId");

-- CreateIndex
CREATE INDEX "ComparisonInsight_insightType_idx" ON "ComparisonInsight"("insightType");

-- AddForeignKey
ALTER TABLE "UniversityMetricHistory" ADD CONSTRAINT "UniversityMetricHistory_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisWeights" ADD CONSTRAINT "AnalysisWeights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonRiskAssessment" ADD CONSTRAINT "ComparisonRiskAssessment_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "Comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonRiskAssessment" ADD CONSTRAINT "ComparisonRiskAssessment_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonInsight" ADD CONSTRAINT "ComparisonInsight_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "Comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;
