import { ArticleFeatures } from '../../../../shared/types/articleForecaster'

const ACADEMORA_BLOCK_TYPES = ['checklist', 'quiz', 'calculator', 'comparison', 'callout', 'cta'] as const

const INITIAL_HEADING_STATE = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].reduce<Record<string, number>>((acc, level) => {
  acc[level] = 0
  return acc
}, {})

const INTERNAL_LINK_PATTERNS = [/^\//, /^#/, /academora\.com/i]

function isInternalLink(href: string): boolean {
  return INTERNAL_LINK_PATTERNS.some((pattern) => pattern.test(href))
}

function createHeadingHierarchy() {
  return { ...INITIAL_HEADING_STATE }
}

function createArticleFeatures(title: string): ArticleFeatures {
  return {
    wordCount: 0,
    headingHierarchy: createHeadingHierarchy(),
    linkCounts: { internal: 0, external: 0 },
    academoraBlocks: {},
    imageCount: 0,
    embedCount: 0,
    titleLength: title.length,
    keywords: [],
    keywordDensity: 0,
    readabilityScore: 0,
  }
}

function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
}

function countWords(text: string): number {
  return normalizeText(text)
    .split(/\s+/)
    .filter(Boolean).length
}

function safeParseContent(content: unknown) {
  if (!content) return { type: 'doc', content: [] }
  if (typeof content === 'object') return content
  try {
    return JSON.parse(String(content))
  } catch (err) {
    return { type: 'doc', content: [] }
  }
}

export function extractFeatures(content: string, title: string, tags: string[]): ArticleFeatures {
  const doc = safeParseContent(content) as any
  const features = createArticleFeatures(title)
  let sentencePunctuation = 0

  function walk(node: any) {
    if (!node || typeof node !== 'object') return

    const { type, text, attrs, marks, content: children } = node

    if (type === 'text' && typeof text === 'string') {
      const words = countWords(text)
      features.wordCount += words
      sentencePunctuation += (text.match(/[.!?]+/g) || []).length
    }

    if (type === 'heading') {
      const level = Math.min(Math.max(1, (attrs?.level as number) || 1), 6)
      const key = `h${level}`
      features.headingHierarchy[key] = (features.headingHierarchy[key] || 0) + 1
    }

    if (type === 'image') {
      features.imageCount += 1
    }

    if (type === 'iframe' || type === 'embed') {
      features.embedCount += 1
    }

    const nodeType = (type || '').toLowerCase()
    if (ACADEMORA_BLOCK_TYPES.includes(nodeType as any)) {
      features.academoraBlocks[nodeType] = (features.academoraBlocks[nodeType] || 0) + 1
    }

    const hrefFromAttrs = attrs?.href
    if (hrefFromAttrs) {
      const internal = isInternalLink(hrefFromAttrs)
      features.linkCounts[internal ? 'internal' : 'external'] += 1
    }

    if (Array.isArray(marks)) {
      marks.forEach((mark) => {
        if (mark?.type === 'link' && mark.attrs?.href) {
          const href = mark.attrs.href
          const internal = isInternalLink(href)
          features.linkCounts[internal ? 'internal' : 'external'] += 1
        }
      })
    }

    if (Array.isArray(children)) {
      children.forEach((child) => walk(child))
    }
  }

  walk(doc)

  const titleWords = countWords(title)
  const tagWords = tags.reduce((acc, tag) => acc + countWords(tag), 0)
  const keywordPool = new Set<string>([
    ...tags.map((t) => normalizeText(t)),
    ...title.split(/\s+/).map((t) => normalizeText(t)),
  ])
  features.keywords = Array.from(keywordPool).filter(Boolean)
  features.keywordDensity = features.wordCount
    ? Math.min(1, (titleWords + tagWords) / features.wordCount)
    : 0

  const sentences = Math.max(1, sentencePunctuation)
  const avgWordsPerSentence = features.wordCount / sentences
  features.readabilityScore = Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * (avgWordsPerSentence / Math.max(1, sentences)))
  )

  return features
}

export const exampleTiptapDoc = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'How to craft an admissions essay that stands out' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Start by understanding the prompt. Craft a strong hook, use specific stories, and tie everything back to the school or program.',
        },
      ],
    },
    {
      type: 'checklist',
      attrs: { checked: false },
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Brainstorm experiences' }] }],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Outline your narrative arc' }] }],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Add relevant statistics and mention the tags like admissions, personal statement, essay tips.',
          marks: [{ type: 'link', attrs: { href: 'https://academora.com/resources/admissions' } }],
        },
      ],
    },
    {
      type: 'calculator',
      attrs: { value: 0 },
      content: [],
    },
  ],
}

export const exampleTiptapString = JSON.stringify(exampleTiptapDoc)
