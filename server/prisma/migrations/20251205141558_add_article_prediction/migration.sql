-- CreateTable
CREATE TABLE "ArticlePrediction" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticlePrediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticlePrediction_articleId_key" ON "ArticlePrediction"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticlePrediction_inputHash_key" ON "ArticlePrediction"("inputHash");

-- CreateIndex
CREATE INDEX "ArticlePrediction_articleId_idx" ON "ArticlePrediction"("articleId");

-- CreateIndex
CREATE INDEX "ArticlePrediction_inputHash_idx" ON "ArticlePrediction"("inputHash");

-- AddForeignKey
ALTER TABLE "ArticlePrediction" ADD CONSTRAINT "ArticlePrediction_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
