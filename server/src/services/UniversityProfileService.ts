// server/src/services/UniversityProfileService.ts
import prisma from '../lib/prisma';
import { get, set, del, delMany, TTL_LONG } from '../lib/cache';
import { University, MicroContent } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { UNIVERSITY_PROFILE_KEY, SCALAR_FIELD_TO_CACHE_TAG, TOP_LEVEL_CACHE_TAGS } from '../lib/constants/cacheTags';

/**
 * Merged Entity containing all university profile data:
 * - Canonical scalar fields from University table
 * - Visual blocks (Hard & Soft) from MicroContent table
 */
export interface MergedProfile {
  university: University;
  microContent: MicroContent[];
}

/**
 * UniversityProfileService handles the "Merged Entity" concept:
 * - Fetches complete university profiles (scalars + blocks)
 * - Implements heavy caching for performance
 * - Manages cache invalidation on data changes
 * 
 * This service powers the public university profile page, serving
 * all content in a single cached response for maximum scalability.
 */
export class UniversityProfileService {

  /**
   * Generates the cache key array for the entire merged profile.
   * Key structure: university:profile:{slug}:{tag}
   */
  private static getCacheKeys(slug: string, tags: string[]): string[] {
    return tags.map(tag => `${UNIVERSITY_PROFILE_KEY}${slug}:${tag}`);
  }

  /**
   * Fetches the complete, merged University profile (scalars + micro-content) from cache or DB.
   * 
   * Performance Strategy:
   * 1. Check cache first (60-minute TTL)
   * 2. If not cached, fetch from database in parallel
   * 3. Merge entities and cache result
   * 
   * @param slug - The university slug (URL-friendly identifier)
   * @returns MergedProfile containing university data and all active blocks
   * @throws AppError if university not found
   */
  public static async getFullProfile(slug: string): Promise<MergedProfile> {
    const cacheKey = `${UNIVERSITY_PROFILE_KEY}${slug}`;
    
    // 1. CACHE HIT: Return immediately (Performance gain)
    const cachedData = get<MergedProfile>(cacheKey);
    if (cachedData) {
      console.log(`[UniversityProfileService] Cache hit for slug: ${slug}`);
      return cachedData;
    }

    console.log(`[UniversityProfileService] Cache miss for slug: ${slug}. Fetching from database...`);

    // 2. CACHE MISS: Fetch from database
    // Fetch University with canonical data (include claimedBy for verification badge)
    const university = await prisma.university.findUnique({
      where: { slug },
      include: {
        // Include user who claimed the university (for verification badge display)
        claimedBy: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true,
            email: true,
          } 
        },
      }
    });

    // Handle not found
    if (!university) {
      throw new AppError(404, `University with slug "${slug}" not found.`);
    }

    // Fetch all active Micro-Content blocks (Soft and Hard blocks)
    // Hard Blocks' "canonical" data is in the `university` object (scalars)
    // MicroContent array holds the visual layout/template for both Hard and Soft blocks
    const microContent = await prisma.microContent.findMany({
      where: { 
        universityId: university.id, 
        isActive: true 
      },
      orderBy: { 
        priority: 'asc' // Crucial for maintaining display order on frontend
      },
    });

    // 3. MERGE ENTITY: Combine university scalars + blocks
    const mergedProfile: MergedProfile = {
      university: university as University,
      microContent: microContent,
    };

    // 4. SET CACHE: Store for 60 minutes (Scalability gain)
    // 60 * 60 seconds = 3600 seconds = 1 hour
    set(cacheKey, mergedProfile, 60 * 60 * 1000); // Convert to milliseconds
    console.log(`[UniversityProfileService] Cached profile for slug: ${slug} (TTL: 60 minutes)`);

    return mergedProfile;
  }

  /**
   * Granularly invalidates only the necessary cache tags based on updated scalar fields.
   * @param slug The university slug.
   * @param updatedFields A list of scalar fields that were updated.
   */
  public static async invalidateProfileCache(slug: string, updatedFields: string[] = []): Promise<void> {
    const tagsToInvalidate = new Set<string>();

    // 1. Identify which tags were affected by the scalar field updates
    updatedFields.forEach(field => {
      const tag = SCALAR_FIELD_TO_CACHE_TAG[field];
      if (tag) {
        tagsToInvalidate.add(tag);
      }
    });
    
    // Always invalidate the microcontent tag if only soft block changed (empty updatedFields)
    if (updatedFields.length === 0) {
      tagsToInvalidate.add('microcontent');
    }
    
    // 2. Add the main canonical key (the merged entity) to the invalidation list
    tagsToInvalidate.add('canonical');
    
    // 3. Generate the specific keys to delete
    const keysToDelete = this.getCacheKeys(slug, Array.from(tagsToInvalidate));
    keysToDelete.push(`${UNIVERSITY_PROFILE_KEY}${slug}:canonical`);
    
    // 4. Execute the targeted deletion
    delMany(keysToDelete);
    
    console.log(`[UniversityProfileService] Granular cache invalidated for slug: ${slug}, tags: ${Array.from(tagsToInvalidate).join(', ')}`);
  }

  /**
   * Bulk invalidates cache for multiple university profiles.
   * Useful for cross-university operations (admin analytics, etc.)
   * 
   * @param slugs - Array of university slugs to invalidate
   */
  public static async invalidateMultipleProfiles(slugs: string[]): Promise<void> {
    for (const slug of slugs) {
      await this.invalidateProfileCache(slug);
    }
    console.log(`[UniversityProfileService] Invalidated cache for ${slugs.length} universities`);
  }

  /**
   * Clears ALL university profile caches.
   * Use cautiously - only for admin operations like bulk data changes.
   */
  public static async invalidateAllProfiles(): Promise<void> {
    // Note: The cache adapter doesn't provide a method to delete by pattern,
    // so this would require a Redis instance with KEYS command or similar.
    // For now, this serves as a reminder of the limitation.
    console.log(`[UniversityProfileService] WARNING: Clear all cache requires Redis support or in-memory cache manual clear`);
    // TODO: Implement bulk invalidation with Redis when migrating to production cache
  }
}
