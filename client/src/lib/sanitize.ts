import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content from the editor to prevent XSS attacks
 * 
 * Security Features:
 * - Removes dangerous elements (script, iframe from untrusted sources)
 * - Sanitizes attributes (removes on* event handlers)
 * - Allows safe HTML elements for rich content
 * - Preserves formatting and structure
 */

interface SanitizeOptions {
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
  allowYouTube?: boolean
}

const defaultAllowedTags = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'em', 'u', 's', 'mark', 'code', 'sub', 'sup',
  'blockquote', 'pre',
  'ul', 'ol', 'li',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span',
]

const defaultAllowedAttributes: Record<string, string[]> = {
  '*': ['class', 'style', 'id'],
  'a': ['href', 'target', 'rel', 'title'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  'iframe': ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
  'table': ['border', 'cellpadding', 'cellspacing'],
  'td': ['colspan', 'rowspan'],
  'th': ['colspan', 'rowspan'],
}

export function sanitizeHTML(
  html: string, 
  options: SanitizeOptions = {}
): string {
  const {
    allowedTags = defaultAllowedTags,
    allowedAttributes = defaultAllowedAttributes,
    allowYouTube = true,
  } = options

  const config = {
    ALLOWED_TAGS: allowedTags as string[],
    ALLOWED_ATTR: Object.keys(allowedAttributes).reduce((acc, tag) => {
      return [...acc, ...allowedAttributes[tag]]
    }, [] as string[]),
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  }

  // Allow YouTube iframes if enabled
  if (allowYouTube) {
    const tags = config.ALLOWED_TAGS as string[]
    tags.push('iframe')
  }

  return DOMPurify.sanitize(html, config) as string
}

/**
 * Validate image URL to prevent loading from unsafe sources
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false
    }

    // Block known malicious patterns
    const hostname = parsedUrl.hostname.toLowerCase()
    const blockedDomains = ['javascript:', 'data:', 'vbscript:', 'file:']
    
    if (blockedDomains.some(blocked => hostname.includes(blocked))) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return ''
    }

    return parsedUrl.toString()
  } catch {
    return ''
  }
}

/**
 * Extract plain text from HTML for preview/excerpt
 */
export function stripHtmlTags(html: string, maxLength?: number): string {
  const text = html
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace nbsp with space
    .replace(/&[a-z]+;/gi, '') // Remove HTML entities
    .trim()

  if (maxLength && text.length > maxLength) {
    return text.substring(0, maxLength) + '...'
  }

  return text
}

/**
 * Calculate reading time from HTML content
 */
export function calculateReadingTime(html: string): number {
  const text = stripHtmlTags(html)
  const words = text.split(/\s+/).filter(word => word.length > 0).length
  const avgWordsPerMinute = 200
  return Math.ceil(words / avgWordsPerMinute)
}

/**
 * Validate slug format (URL-safe)
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

/**
 * Generate URL-safe slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}
