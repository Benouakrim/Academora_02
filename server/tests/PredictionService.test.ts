import { extractFeatures } from '../src/lib/predictor/featureExtractor'
import predictionService from '../src/services/PredictionService'

type PrismaMock = {
  articlePrediction: {
    create: jest.Mock<any, any>
  }
  article: {
    findUnique: jest.Mock<any, any>
  }
}

const mockArticlePredictionCreate = jest.fn().mockResolvedValue({})
const mockPrisma: PrismaMock = {
  articlePrediction: {
    create: mockArticlePredictionCreate,
  },
  article: {
    findUnique: jest.fn().mockResolvedValue(null),
  },
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}))

describe('PredictionService / Feature Extraction', () => {
  const mockDoc = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Admissions deep dive' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'This article covers tips and tricks for admissions.' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Use quizzes and calculators to help readers.' }],
      },
      { type: 'quiz', content: [] },
      { type: 'calculator', content: [] },
    ],
  }

  const mockPayload = {
    articleId: 'article-1',
    category: 'Admissions',
    content: JSON.stringify(mockDoc),
    title: 'Admissions deep dive',
    tags: ['admissions', 'essay'],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('extracts accurate word counts and block tallies', () => {
    const features = extractFeatures(mockPayload.content, mockPayload.title, mockPayload.tags)
    expect(features.wordCount).toBe(18)
    expect(features.academoraBlocks['quiz']).toBe(1)
    expect(features.academoraBlocks['calculator']).toBe(1)
  })

  it('persists prediction results and surfaces extractor metrics', async () => {
    const result = await predictionService.generatePrediction(mockPayload)
    expect(result.features.wordCount).toBe(18)
    expect(result.features.academoraBlocks['quiz']).toBe(1)
    expect(result.features.academoraBlocks['calculator']).toBe(1)
    expect(result.adRevenue).toBeGreaterThan(0)
    expect(mockArticlePredictionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ articleId: mockPayload.articleId }),
      })
    )
  })
})
