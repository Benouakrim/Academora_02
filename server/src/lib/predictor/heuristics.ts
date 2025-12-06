import { ArticleFeatures } from '../../../../shared/types/articleForecaster'
import type { IndustryBenchmarks } from './benchmarks'

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

export function calculateReadTime(wordCount: number): number {
  return Math.max(0.5, wordCount / 200)
}

export function calculateConfidenceScore(wordCount: number): number {
  return Math.round(sigmoid(Math.log(1 + wordCount)) * 100)
}

export function calculateTrafficForecast(
  features: ArticleFeatures,
  category: string | undefined,
  benchmarks: IndustryBenchmarks
): { low: number; med: number; high: number } {
  const benchmark = benchmarks.categories[category || ''] || benchmarks.defaults
  const keywordMultiplier = Math.max(0.6, 0.15 * Math.max(1, features.keywords.length))
  const qualityScore = 0.6 + Math.min(0.6, features.keywordDensity + features.readabilityScore / 180)
  const baseTraffic = benchmark.avgSearchVolume * benchmark.avgCTR * keywordMultiplier
  const seasonalTraffic = baseTraffic * benchmark.seasonalMultiplier * qualityScore
  const median = Math.round(seasonalTraffic)
  return {
    low: Math.round(median * 0.65),
    med: median,
    high: Math.round(median * 1.35),
  }
}

export function calculateAdRevenue(trafficMedian: number, rpm: number): number {
  return Math.round((trafficMedian / 1000) * rpm * 100) / 100
}

export function calculateConversionEstimate(features: ArticleFeatures): number {
  const ctaCount = features.academoraBlocks['cta'] || 0
  const comparisonCount = features.academoraBlocks['comparison'] || 0
  const baseConversion = 1 + ctaCount * 0.35 + comparisonCount * 0.25
  const keywordBoost = 1 + Math.min(0.5, features.keywordDensity)
  const readabilityBoost = 0.7 + Math.min(0.3, features.readabilityScore / 100)
  return Math.min(20, Math.round(baseConversion * keywordBoost * readabilityBoost * 100) / 100)
}

export function calculateSeoScore(features: ArticleFeatures): number {
  const headingTotal = Object.values(features.headingHierarchy).reduce((sum, value) => sum + value, 0)
  const headingScore = Math.min(1, headingTotal / 5)
  const titleScore = Math.max(0, Math.min(1, 1 - Math.abs(features.titleLength - 60) / 60))
  const lengthScore = Math.min(1, features.wordCount / 1000)
  const readabilityScore = Math.min(1, Math.max(0, (100 - features.readabilityScore) / 100))
  const mediaScore = Math.min(1, (features.imageCount + features.embedCount) / 3)
  const keywordScore = Math.min(1, features.keywordDensity * 10)
  const internalLinkScore = Math.min(1, features.linkCounts.internal / 4)

  const weightSum = 0.08 + 0.1 + 0.12 + 0.1 + 0.07 + 0.08 + 0.05
  const score =
    titleScore * 0.1 +
    headingScore * 0.12 +
    lengthScore * 0.12 +
    readabilityScore * 0.1 +
    mediaScore * 0.08 +
    keywordScore * 0.1 +
    internalLinkScore * 0.08 +
    Math.min(1, features.academoraBlocks['cta'] || 0) * 0.05

  return Math.round(Math.max(0, Math.min(100, (score / (weightSum + 0.05)) * 100)))
}
