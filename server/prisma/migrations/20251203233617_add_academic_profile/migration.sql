-- CreateTable
CREATE TABLE "AcademicProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gpa" DOUBLE PRECISION,
    "gpaScale" INTEGER,
    "testScores" JSONB,
    "highSchoolName" TEXT,
    "gradYear" INTEGER,
    "primaryMajor" TEXT,
    "secondaryMajor" TEXT,
    "extracurriculars" TEXT[],
    "academicHonors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicProfile_userId_key" ON "AcademicProfile"("userId");

-- CreateIndex
CREATE INDEX "AcademicProfile_userId_idx" ON "AcademicProfile"("userId");

-- CreateIndex
CREATE INDEX "AcademicProfile_gradYear_idx" ON "AcademicProfile"("gradYear");

-- CreateIndex
CREATE INDEX "AcademicProfile_gpa_idx" ON "AcademicProfile"("gpa");

-- CreateIndex
CREATE INDEX "AcademicProfile_primaryMajor_idx" ON "AcademicProfile"("primaryMajor");

-- AddForeignKey
ALTER TABLE "AcademicProfile" ADD CONSTRAINT "AcademicProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
