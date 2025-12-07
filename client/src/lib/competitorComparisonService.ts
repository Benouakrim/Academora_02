/**
 * Competitor Comparison Service
 * Generates mock competitor data for SERP comparison
 */

import type { ArticleFeatures } from '../../../shared/types/articleForecaster'

export interface CompetitorResult {
  rank: number
  title: string
  url: string
  wordCount: number
  headings: number
  images: number
  readTime: number
}

export interface CompetitorComparison {
  keyword: string
  yourStats: {
    wordCount: number
    headings: number
    images: number
    readTime: number
  }
  averageStats: {
    wordCount: number
    headings: number
    images: number
    readTime: number
  }
  competitors: CompetitorResult[]
  recommendations: string[]
}

/**
 * Generate mock competitor SERP data for educational content
 */
export function generateMockCompetitors(keyword: string, features: ArticleFeatures): CompetitorComparison {
  // Mock competitor data - in production, this would call a SERP API
  const mockCompetitors: CompetitorResult[] = [
    {
      rank: 1,
      title: `Best Guide to ${keyword} - Complete Tutorial 2024`,
      url: 'competitor1.edu',
      wordCount: 2850,
      headings: 8,
      images: 12,
      readTime: 14,
    },
    {
      rank: 2,
      title: `${keyword} Explained: Everything You Need to Know`,
      url: 'competitor2.edu',
      wordCount: 2150,
      headings: 6,
      images: 8,
      readTime: 11,
    },
    {
      rank: 3,
      title: `Ultimate ${keyword} Resource - Tips and Strategies`,
      url: 'competitor3.edu',
      wordCount: 1850,
      headings: 5,
      images: 10,
      readTime: 9,
    },
  ]

  // Calculate average stats
  const avgWordCount = Math.round(mockCompetitors.reduce((sum, c) => sum + c.wordCount, 0) / mockCompetitors.length)
  const avgHeadings = Math.round(mockCompetitors.reduce((sum, c) => sum + c.headings, 0) / mockCompetitors.length)
  const avgImages = Math.round(mockCompetitors.reduce((sum, c) => sum + c.images, 0) / mockCompetitors.length)
  const avgReadTime = Math.round(mockCompetitors.reduce((sum, c) => sum + c.readTime, 0) / mockCompetitors.length)

  // Generate recommendations based on comparison
  const recommendations: string[] = []

  if (features.wordCount < avgWordCount) {
    recommendations.push(
      `Your article is ${avgWordCount - features.wordCount} words shorter than the average top result. Consider expanding your content for better rankings.`
    )
  }

  if (features.headingHierarchy.h2 < avgHeadings) {
    recommendations.push(
      `Top competitors average ${avgHeadings} headings. Add more H2 subheadings to structure your content better.`
    )
  }

  if (features.imageCount < avgImages) {
    recommendations.push(
      `Top competitors average ${avgImages} images. Adding more visuals could improve reader engagement and SEO.`
    )
  }

  if (recommendations.length === 0) {
    recommendations.push('Your content metrics are competitive with top-ranking articles for this keyword!')
  }

  return {
    keyword,
    yourStats: {
      wordCount: features.wordCount,
      headings: Object.values(features.headingHierarchy).reduce((a, b) => a + b, 0),
      images: features.imageCount,
      readTime: Math.ceil(features.wordCount / 200),
    },
    averageStats: {
      wordCount: avgWordCount,
      headings: avgHeadings,
      images: avgImages,
      readTime: avgReadTime,
    },
    competitors: mockCompetitors,
    recommendations,
  }
}
