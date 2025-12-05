# Database Migration Guide

## Overview
This guide covers the migration steps needed to apply the enhanced analysis engine schema changes.

## Step 1: Run Prisma Migration

### Generate Migration
```bash
cd server
npx prisma migrate dev --name add_analysis_engine_enhancements
```

This will:
1. Create a migration file with all schema changes
2. Apply the migration to your database
3. Regenerate the Prisma Client

### Migration File Location
`server/prisma/migrations/[timestamp]_add_analysis_engine_enhancements/migration.sql`

## Step 2: Schema Changes Summary

### New Fields Added to University Model

```sql
-- Financial & ROI Fields
ALTER TABLE "University" ADD COLUMN "timeToEmploymentMonths" INTEGER;
ALTER TABLE "University" ADD COLUMN "averageSalaryByMajor" JSONB;
ALTER TABLE "University" ADD COLUMN "ROIPercentage" DOUBLE PRECISION;
ALTER TABLE "University" ADD COLUMN "alumniEarnings5Years" INTEGER;
ALTER TABLE "University" ADD COLUMN "alumniEarnings10Years" INTEGER;

-- Research Fields
ALTER TABLE "University" ADD COLUMN "researchOutputScore" DOUBLE PRECISION;
ALTER TABLE "University" ADD COLUMN "citationIndex" INTEGER;
ALTER TABLE "University" ADD COLUMN "fundedResearch" INTEGER;

-- Industry Partnerships
ALTER TABLE "University" ADD COLUMN "partnerCompaniesCount" INTEGER;
ALTER TABLE "University" ADD COLUMN "industryPartnerships" TEXT[];

-- Student Experience
ALTER TABLE "University" ADD COLUMN "studentSatisfactionScore" DOUBLE PRECISION;
ALTER TABLE "University" ADD COLUMN "geographicDiversityScore" DOUBLE PRECISION;
ALTER TABLE "University" ADD COLUMN "internshipPlacementRate" DOUBLE PRECISION;
```

### New Tables

#### UniversityMetricHistory
```sql
CREATE TABLE "UniversityMetricHistory" (
  "id" TEXT NOT NULL PRIMARY KEY,
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
  CONSTRAINT "UniversityMetricHistory_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE,
  UNIQUE("universityId", "year")
);

CREATE INDEX "UniversityMetricHistory_universityId_idx" ON "UniversityMetricHistory"("universityId");
CREATE INDEX "UniversityMetricHistory_year_idx" ON "UniversityMetricHistory"("year");
```

#### AnalysisWeights
```sql
CREATE TABLE "AnalysisWeights" (
  "id" TEXT NOT NULL PRIMARY KEY,
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
  CONSTRAINT "AnalysisWeights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE("userId")
);

CREATE INDEX "AnalysisWeights_userId_idx" ON "AnalysisWeights"("userId");
```

#### ComparisonRiskAssessment
```sql
CREATE TABLE "ComparisonRiskAssessment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "comparisonId" TEXT NOT NULL,
  "universityId" TEXT NOT NULL,
  "riskFactors" JSONB,
  "overallRiskScore" DOUBLE PRECISION NOT NULL,
  "recommendations" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ComparisonRiskAssessment_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "Comparison"("id") ON DELETE CASCADE,
  CONSTRAINT "ComparisonRiskAssessment_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE,
  UNIQUE("comparisonId", "universityId")
);

CREATE INDEX "ComparisonRiskAssessment_comparisonId_idx" ON "ComparisonRiskAssessment"("comparisonId");
CREATE INDEX "ComparisonRiskAssessment_universityId_idx" ON "ComparisonRiskAssessment"("universityId");
```

#### ComparisonInsight
```sql
CREATE TABLE "ComparisonInsight" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "comparisonId" TEXT NOT NULL,
  "insight" TEXT NOT NULL,
  "insightType" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ComparisonInsight_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "Comparison"("id") ON DELETE CASCADE
);

CREATE INDEX "ComparisonInsight_comparisonId_idx" ON "ComparisonInsight"("comparisonId");
CREATE INDEX "ComparisonInsight_insightType_idx" ON "ComparisonInsight"("insightType");
```

### Relations Added

#### User → AnalysisWeights
```
analysisWeights: AnalysisWeights?
```

#### University → UniversityMetricHistory
```
metricHistory: UniversityMetricHistory[]
```

#### University → ComparisonRiskAssessment
```
riskAssessments: ComparisonRiskAssessment[]
```

#### Comparison → ComparisonRiskAssessment
```
riskAssessments: ComparisonRiskAssessment[]
```

#### Comparison → ComparisonInsight
```
insights: ComparisonInsight[]
```

## Step 3: Database Seeding (Optional but Recommended)

### Update Seed Data
Add sample data for the new fields in `server/prisma/seed.ts`:

```typescript
// Update university seeding to include new fields
await prisma.university.update({
  where: { id: universityId },
  data: {
    timeToEmploymentMonths: 6,
    averageSalaryByMajor: {
      "Computer Science": 120000,
      "Business": 85000,
      "Engineering": 110000
    },
    ROIPercentage: 180,
    alumniEarnings5Years: 95000,
    alumniEarnings10Years: 135000,
    researchOutputScore: 85,
    citationIndex: 45,
    fundedResearch: 250,
    partnerCompaniesCount: 85,
    industryPartnerships: ["Google", "Microsoft", "Apple", ...],
    studentSatisfactionScore: 4.2,
    geographicDiversityScore: 0.75,
    internshipPlacementRate: 0.92
  }
});

// Seed historical data for trends
for (let year = 2019; year <= 2024; year++) {
  await prisma.universityMetricHistory.create({
    data: {
      universityId,
      year,
      ranking: 15 + (2024 - year), // Example: improved ranking over time
      acceptanceRate: 0.05 + (year - 2019) * 0.002,
      tuitionCost: 60000 + (year - 2019) * 2000,
      employmentRate: 0.88 + (year - 2019) * 0.01,
      averageSalary: 110000 + (year - 2019) * 5000,
      studentCount: 8500
    }
  });
}
```

### Run Seed
```bash
cd server
npx prisma db seed
```

## Step 4: Verify Migration

### Check Tables Created
```sql
-- Verify new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('UniversityMetricHistory', 'AnalysisWeights', 'ComparisonRiskAssessment', 'ComparisonInsight');
```

### Check New Columns
```sql
-- Verify University table columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'University' 
AND column_name IN ('researchOutputScore', 'studentSatisfactionScore', 'ROIPercentage', ...);
```

### Generate Prisma Client
```bash
npx prisma generate
```

## Step 5: Backend Updates

### Install Dependencies (if needed)
```bash
cd server
npm install
```

### Rebuild TypeScript
```bash
npm run build
```

### Test New Services
```bash
npm test
```

## Step 6: Environment Variables

No new environment variables required. However, for email functionality, ensure you have:

```env
# Optional for email reporting
SENDGRID_API_KEY=your_key
SENDGRID_FROM_EMAIL=noreply@academora.com
CLIENT_URL=https://yourapp.com
```

## Step 7: API Testing

### Test Enhanced Analysis Endpoint
```bash
curl -X POST http://localhost:3000/api/compare/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "universityIds": ["id1", "id2", "id3"],
    "weights": {
      "ranking": 0.3,
      "cost": 0.25,
      "acceptance": 0.15,
      "employmentRate": 0.2,
      "studentSatisfaction": 0.10
    }
  }'
```

### Test Risk Assessment
```bash
curl -X POST http://localhost:3000/api/compare/risks \
  -H "Content-Type: application/json" \
  -d '{"universityIds": ["id1", "id2"]}'
```

### Test Reports
```bash
curl -X POST http://localhost:3000/api/compare/report/csv \
  -H "Content-Type: application/json" \
  -d '{"universityIds": ["id1", "id2"]}' \
  > comparison.csv
```

## Rollback Instructions

If you need to rollback the migration:

```bash
cd server
npx prisma migrate resolve --rolled-back add_analysis_engine_enhancements
npx prisma db push
```

Or manually:
```bash
npx prisma migrate reset
```

## Performance Considerations

### Indexes
- All new foreign keys are indexed
- Composite indexes on (universityId, year) for history
- Single indexes on userId for weights
- Comparison-based indexes for risk assessments

### Query Optimization
- Use `select` to limit returned fields when possible
- Batch requests (max 5 universities per request)
- Cache analysis results where appropriate
- Historical data is stored separately from main university record

### Storage Impact
- ~50KB per university for new fields
- ~10KB per university per year of historical data
- ~5KB per comparison for risk assessment
- ~2KB per comparison for insights

## Monitoring

After migration, monitor:
1. Query performance on new tables
2. Index usage statistics
3. Storage growth rate
4. API response times for new endpoints

---

## Questions or Issues?

If you encounter any issues during migration:
1. Check Prisma logs: `npx prisma debug`
2. Verify database connection
3. Ensure all tables created successfully
4. Check foreign key constraints
5. Verify indexes are created
