import { createHash } from 'crypto'
import { extractFeatures } from '../lib/predictor/featureExtractor'
import { INDUSTRY_BENCHMARKS } from '../lib/predictor/benchmarks'
import benchmarkService from '../lib/predictor/benchmarkService'
import {
  calculateAdRevenue,
  calculateConfidenceScore,
  calculateConversionEstimate,
  calculateReadTime,
  calculateSeoScore,
  calculateTrafficForecast,
} from '../lib/predictor/heuristics'
import type { ArticleFeatures, PredictRequest, PredictionResult } from '../../../shared/types/articleForecaster'
import prisma from '../lib/prisma'

function normalizeCategory(category?: string) {
  const clean = category?.trim()
  return clean && clean.length > 0 ? clean : 'Default'
}

function buildRecommendations(features: ArticleFeatures, category: string): string[] {
  const recs: string[] = []
  if (features.wordCount < 700) recs.push('Add more depth to the article to hit the 700+ word benchmark for better rankings.')
  if ((features.academoraBlocks['cta'] || 0) === 0) recs.push('Include a CTA block to help readers take the next step.')
  if ((features.academoraBlocks['comparison'] || 0) === 0) recs.push('Compare options or outcomes to help readers make decisions.')
  if (features.keywordDensity < 0.03) recs.push('Use your primary keywords more frequently to improve keyword density.')
  if (features.readabilityScore < 60) recs.push('Break up long sentences and simplify language to improve readability.')
  if (category === 'Financial Aid' && features.linkCounts.external < 2) recs.push('Add official financial references to build credibility for financial aid content.')
  return recs
}

export class PredictionService {
  version = 1

  async generatePrediction(data: PredictRequest): Promise<PredictionResult> {
    const normalizedCategory = normalizeCategory(data.category)
    const features = extractFeatures(data.content, data.title, data.tags)
    const seoScore = calculateSeoScore(features)
    const readTime = calculateReadTime(features.wordCount)
    const confidence = calculateConfidenceScore(features.wordCount)
    
    // Load benchmarks from database with fallback to hardcoded defaults
    const benchmarks = await benchmarkService.getBenchmarks()
    
    const trafficForecast = calculateTrafficForecast(features, normalizedCategory, benchmarks)
    const benchmark = benchmarks.categories[normalizedCategory] || benchmarks.defaults
    const adRevenue = calculateAdRevenue(trafficForecast.med, benchmark.rpm)
    const conversionRate = calculateConversionEstimate(features)
    const recommendations = buildRecommendations(features, normalizedCategory)

    const result: PredictionResult = {
      seoScore,
      trafficForecast,
      adRevenue,
      recommendations,
      confidence,
      readTime,
      conversionRate,
      features,
    }

    if (data.articleId) {
      const inputHash = createHash('sha256')
        .update(JSON.stringify({ content: data.content, title: data.title, tags: data.tags, category: normalizedCategory }))
        .digest('hex')

      try {
        const existing = await prisma.articlePrediction.findFirst({
          where: { articleId: data.articleId }
        });

        if (existing) {
          await prisma.articlePrediction.update({
            where: { id: existing.id },
            data: {
              inputHash,
              features: features as any,
              result: result as any,
              version: this.version,
            },
          });
        } else {
          await prisma.articlePrediction.create({
            data: {
              articleId: data.articleId,
              inputHash,
              features: features as any,
              result: result as any,
              version: this.version,
            },
          });
        }
      } catch (err) {
        // swallow persistence errors so prediction still returns
        console.warn('Prediction persistence failed', err)
      }
    }

    return result
  }

  async getHistory(articleId: string) {
    return prisma.articlePrediction.findMany({ where: { articleId }, orderBy: { createdAt: 'desc' } })
  }

  async runBatchPredictions(articleIds: string[]) {
    const results: Record<string, PredictionResult> = {}
    for (const id of articleIds) {
      const article = await prisma.article.findUnique({
        where: { id },
        include: { tags: true, category: true },
      })
      if (!article) continue
      try {
        const res = await this.generatePrediction({
          content: article.content,
          title: article.title,
          tags: article.tags?.map((tag: any) => tag.name) || [],
          category: article.category?.name || 'Default',
          articleId: id,
        })
        results[id] = res
      } catch (err) {
        continue
      }
    }
    return results
  }
}

export default new PredictionService()
