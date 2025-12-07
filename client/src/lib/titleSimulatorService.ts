/**
 * A/B Title Simulator Service
 * Analyzes multiple title variations based on SEO and engagement factors
 */

export interface TitleAnalysis {
  title: string
  seoScore: number
  engagementScore: number
  readabilityScore: number
  totalScore: number
  keywordPresence: boolean
  powerWords: string[]
  keywordTriggers: string[]
  recommendations: string[]
}

// Keywords that often appear in high-performing titles
const POWER_WORDS = [
  'guide', 'how to', 'best', 'ultimate', 'complete', 'proven', 'secret', 'tips',
  'tricks', 'hacks', 'essential', 'definitive', 'comprehensive', 'simple',
  'easy', 'quick', 'fast', 'step-by-step', 'tutorial', 'mastery',
]

// Emotional trigger words
const EMOTIONAL_TRIGGERS = [
  'incredible', 'amazing', 'stunning', 'shocking', 'revolutionary', 'game-changing',
  'breakthrough', 'powerful', 'crucial', 'vital', 'essential', 'critical',
]

export function analyzeTitles(titles: string[], focusKeyword?: string): TitleAnalysis[] {
  return titles.map(title => analyzeSingleTitle(title, focusKeyword))
}

function analyzeSingleTitle(title: string, focusKeyword?: string): TitleAnalysis {
  const lowerTitle = title.toLowerCase()
  const wordCount = title.split(/\s+/).length
  const charCount = title.length

  // SEO Score (based on keyword presence and length)
  let seoScore = 0
  const hasKeyword = focusKeyword && lowerTitle.includes(focusKeyword.toLowerCase())
  seoScore += hasKeyword ? 30 : 0
  seoScore += charCount >= 40 && charCount <= 65 ? 25 : charCount >= 30 && charCount <= 75 ? 15 : 0
  seoScore += wordCount >= 4 && wordCount <= 10 ? 20 : 0
  seoScore += lowerTitle.includes('2024') || lowerTitle.includes('2025') ? 15 : 0
  seoScore += (lowerTitle.match(/[\d]/g) || []).length > 0 ? 10 : 0

  // Engagement Score (based on power words and emotional triggers)
  let engagementScore = 0
  const foundPowerWords: string[] = []
  const foundEmotionalTriggers: string[] = []

  POWER_WORDS.forEach(word => {
    if (lowerTitle.includes(word)) {
      engagementScore += 8
      foundPowerWords.push(word)
    }
  })

  EMOTIONAL_TRIGGERS.forEach(word => {
    if (lowerTitle.includes(word)) {
      engagementScore += 5
      foundEmotionalTriggers.push(word)
    }
  })

  // Questions often perform well
  if (title.includes('?')) engagementScore += 10

  // Readability Score
  let readabilityScore = 0
  readabilityScore += charCount >= 50 && charCount <= 65 ? 35 : 0
  readabilityScore += !lowerTitle.includes('|') ? 20 : 0 // Pipes reduce readability
  readabilityScore += wordCount <= 8 ? 25 : 0
  readabilityScore += !title.includes('(') ? 10 : 0 // Parentheses can be cluttered
  readabilityScore += (lowerTitle.match(/[!]/g) || []).length <= 1 ? 10 : 0 // Too many exclamations

  // Normalize scores to 0-100
  seoScore = Math.min(100, seoScore)
  engagementScore = Math.min(100, engagementScore)
  readabilityScore = Math.min(100, readabilityScore)

  // Total score (weighted average)
  const totalScore = Math.round(seoScore * 0.4 + engagementScore * 0.35 + readabilityScore * 0.25)

  // Generate recommendations
  const recommendations: string[] = []
  if (!hasKeyword && focusKeyword) {
    recommendations.push(`Include the keyword "${focusKeyword}" for better SEO ranking.`)
  }
  if (charCount < 40) {
    recommendations.push('Title is too short. Aim for 40-65 characters for best performance.')
  }
  if (charCount > 75) {
    recommendations.push('Title is too long. Shorten to 40-65 characters for better click-through rates.')
  }
  if (wordCount < 4) {
    recommendations.push('Add more words to your title for clarity and context.')
  }
  if (wordCount > 10) {
    recommendations.push('Consider shortening to 4-8 words for better readability.')
  }
  if (!title.includes('?') && !foundPowerWords.length) {
    recommendations.push('Add a power word (like "Guide", "Best", "How To") to increase engagement.')
  }
  if (totalScore >= 80 && recommendations.length === 0) {
    recommendations.push('Excellent title! This version is highly optimized for both search and engagement.')
  }

  return {
    title,
    seoScore: Math.round(seoScore),
    engagementScore: Math.round(engagementScore),
    readabilityScore: Math.round(readabilityScore),
    totalScore,
    keywordPresence: hasKeyword || false,
    powerWords: foundPowerWords,
    keywordTriggers: foundEmotionalTriggers,
    recommendations,
  }
}
