import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';
import type { MicroContentBlock } from '@/../../shared/types/microContentBlocks';

/**
 * SearchIndexingService: Full-Text Search Index Generator
 * 
 * P29: Soft Block Full-Text Search Indexing
 * 
 * This service extracts rich, descriptive text from Soft Blocks (MicroContent)
 * and builds a searchable index that combines:
 * - Canonical data (University name, city, majors)
 * - Soft Block content (testimonials, FAQs, announcements, etc.)
 * 
 * The searchVector field is then used in search queries via PostgreSQL FTS.
 */
export class SearchIndexingService {
  /**
   * List of block types whose content should be included in the FTS index.
   * These are typically "soft" blocks with rich text that benefits search.
   */
  private static readonly INDEXABLE_BLOCK_TYPES = [
    'rich_text_block',
    'testimonial_quote',
    'link_list_resources',
    'faq_accordion',
    'announcement_banner',
  ];

  /**
   * Extracts searchable text from a single MicroContent block's JSON data.
   * Handles different block types and safely extracts all relevant text.
   * 
   * @param block The MicroContent block with type and data
   * @returns Concatenated, searchable text from the block
   */
  private static extractTextFromBlock(block: any): string {
    const data = block.data as Record<string, any>;
    let text = block.title || '';

    switch (block.blockType) {
      case 'rich_text_block':
        // Rich text content (can be HTML or plain text)
        text += ' ' + (data.content || '');
        break;

      case 'testimonial_quote':
        // Testimonial: quote + author name + author title
        text += ' ' + (data.quote || '') + ' ' + (data.author || '') + ' ' + (data.authorTitle || '');
        break;

      case 'link_list_resources':
        // Extract all link titles and descriptions
        (data.links as any[] || []).forEach((link) => {
          text += ' ' + (link.title || '') + ' ' + (link.description || '');
        });
        break;

      case 'faq_accordion':
        // FAQ: question + answer (very searchable content)
        text += ' ' + (data.question || '') + ' ' + (data.answer || '');
        break;

      case 'announcement_banner':
        // Announcement message
        text += ' ' + (data.message || '');
        break;

      default:
        // Fallback: serialize all string values in the data object
        // This safely handles any unlisted soft blocks
        Object.values(data).forEach((val) => {
          if (typeof val === 'string') {
            text += ' ' + val;
          }
        });
    }

    // Clean up excessive whitespace and return lowercased for consistent matching
    return text.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  /**
   * Builds the full search vector for a single university and updates the database.
   * This is a heavy, periodic operation that should be run as part of daily maintenance.
   * 
   * Process:
   * 1. Fetch all indexable MicroContent blocks for the university
   * 2. Extract text from each block
   * 3. Fetch canonical university data (name, city, state, majors)
   * 4. Combine canonical + soft block text
   * 5. Update the searchVector field in the database
   * 6. Invalidate cached profile to ensure freshness
   * 
   * @param universityId The UUID of the university to index
   * @throws AppError if university not found
   */
  public static async indexUniversity(universityId: string): Promise<void> {
    // 1. Fetch all indexable MicroContent blocks for this university
    const microContent = (await prisma.microContent.findMany({
      where: {
        universityId,
        isActive: true,
        blockType: { in: this.INDEXABLE_BLOCK_TYPES },
      },
    })) as any[];

    // 2. Extract and concatenate text from Soft Blocks
    const softBlockText = microContent
      .map((block) => this.extractTextFromBlock(block))
      .filter((text) => text.length > 0)
      .join(' ');

    // 3. Fetch Canonical Scalar data for essential keywords (name, city, majors, etc.)
    const canonicalData = await prisma.university.findUnique({
      where: { id: universityId },
      select: {
        name: true,
        city: true,
        state: true,
        popularMajors: true,
        slug: true,
        description: true,
      },
    });

    if (!canonicalData) {
      throw new AppError(404, `University not found for indexing: ${universityId}`);
    }

    // 4. Combine all searchable data (Canonical + Soft Blocks)
    const canonicalText = [
      canonicalData.name,
      canonicalData.city,
      canonicalData.state,
      canonicalData.description,
      ...(canonicalData.popularMajors || []),
    ]
      .filter((val) => val && typeof val === 'string')
      .join(' ')
      .toLowerCase();

    const fullSearchableText = (canonicalText + ' ' + softBlockText).replace(/\s+/g, ' ').trim();

    // 5. Update the searchVector column in the database
    await prisma.university.update({
      where: { id: universityId },
      data: {
        searchVector: fullSearchableText, // Stores the raw concatenated text
        searchVectorUpdatedAt: new Date(),
      },
    });

    // 6. Invalidate the profile cache to ensure the newly indexed content is not stale
    // This ensures the next fetch gets fresh data
    try {
      const { UniversityProfileService } = await import('./UniversityProfileService');
      await UniversityProfileService.invalidateProfileCache(canonicalData.slug, ['search']);
    } catch (err) {
      console.warn(`[SearchIndexingService] Failed to invalidate cache for ${universityId}:`, err);
      // Do not throw, allow indexing to complete even if cache invalidation fails
    }
  }

  /**
   * Bulk indexing for all universities (or a filtered subset).
   * Runs in parallel for efficiency, but with error handling for individual failures.
   * 
   * @param universityIds Array of university IDs to index (or undefined for all)
   * @param batchSize Optional: process in batches to avoid connection pool exhaustion
   */
  public static async indexMultipleUniversities(
    universityIds?: string[],
    batchSize: number = 10
  ): Promise<{
    succeeded: number;
    failed: number;
    errors: Array<{ universityId: string; error: string }>;
  }> {
    // Fetch all university IDs if not provided
    let idsToIndex: string[] | undefined = universityIds;
    if (!idsToIndex) {
      const universities = await prisma.university.findMany({
        select: { id: true },
      });
      idsToIndex = universities.map((u: { id: string }) => u.id);
    }

    console.log(`[SearchIndexingService] Starting bulk indexing for ${idsToIndex.length} universities...`);
    console.log(`[SearchIndexingService] Starting bulk indexing for ${idsToIndex?.length || 0} universities...`);

    let succeeded = 0;
    let failed = 0;
    const errors: Array<{ universityId: string; error: string }> = [];

    // Process in batches to avoid overwhelming the database
    if (idsToIndex && idsToIndex.length > 0) {
      for (let i = 0; i < idsToIndex.length; i += batchSize) {
        const batch = idsToIndex.slice(i, i + batchSize);

        const results = await Promise.allSettled(
          batch.map((id) =>
            this.indexUniversity(id).catch((err) => {
              throw { universityId: id, error: err instanceof Error ? err.message : String(err) };
            })
          )
        );

        results.forEach((result, idx) => {
          const universityId = batch[idx];
          if (result.status === 'fulfilled') {
            succeeded++;
          } else {
            failed++;
            errors.push(result.reason);
          }
        });
      }
    }

    console.log(
      `[SearchIndexingService] Bulk indexing completed. Succeeded: ${succeeded}, Failed: ${failed}`
    );

    return { succeeded, failed, errors };
  }
}
