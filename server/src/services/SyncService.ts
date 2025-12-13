import { UserRole } from '@prisma/client';
import { clerkClient } from '@clerk/express';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

export class SyncService {

  /**
   * Syncs key Neon user data (role, names) back to Clerk's public metadata.
   * This ensures client-side authentication and gating is instant and accurate.
   */
  static async syncNeonToClerk(neonUserId: string) {
    const user = await prisma.user.findUnique({
      where: { id: neonUserId },
      select: { clerkId: true, role: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found in Neon DB');
    }
    
    // Push the Neon user data to Clerk metadata
    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: { 
        role: user.role.toLowerCase(),
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    return { success: true, clerkId: user.clerkId };
  }


  /**
   * Reconciliation: Fetches all Clerk users and creates/updates missing records in Neon.
   * Also optionally cleans up orphaned Neon users that don't exist in Clerk.
   */
  static async reconcileClerkToNeon(options?: { cleanupOrphaned?: boolean }) {
    console.log('[SyncService] Starting full Clerk-to-Neon reconciliation...');
    let clerkUsers = await clerkClient.users.getUserList({ limit: 500 });
    let createdCount = 0;
    let updatedCount = 0;
    let rolesSynced = 0;
    let deletedCount = 0;

    const clerkUserIds = new Set(clerkUsers.data.map(u => u.id));

    for (const clerkUser of clerkUsers.data) {
      const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
      
      if (!email) {
        console.warn(`Skipping Clerk user ${clerkUser.id}: No primary email found.`);
        continue;
      }

      let neonUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
      const clerkRole = (clerkUser.publicMetadata.role as string)?.toUpperCase() as UserRole || UserRole.USER;

      if (!neonUser) {
        // Create missing Neon user
        neonUser = await prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            email: email,
            firstName: clerkUser.firstName || undefined,
            lastName: clerkUser.lastName || undefined,
            avatarUrl: clerkUser.imageUrl || undefined,
            role: clerkRole,
          },
        });
        createdCount++;
      } else {
        // Update existing Neon user (e.g., if name/email changed in Clerk)
        await prisma.user.update({
            where: { id: neonUser.id },
            data: {
                email: email,
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                avatarUrl: clerkUser.imageUrl,
                // Do NOT overwrite Neon role unless necessary, Neon is SOT for role
            }
        });
        updatedCount++;
      }
      
      // Ensure Neon's role is correctly pushed back to Clerk (Neon is source of truth for roles)
      try {
        const currentClerkRole = (clerkUser.publicMetadata.role as string)?.toUpperCase();
        if (currentClerkRole !== neonUser.role) {
          await clerkClient.users.updateUserMetadata(clerkUser.id, {
            publicMetadata: { 
              role: neonUser.role.toLowerCase(),
              firstName: neonUser.firstName,
              lastName: neonUser.lastName,
            },
          });
          rolesSynced++;
        }
      } catch (err) {
        console.error(`Failed to sync role for user ${neonUser.id}:`, err);
      }
    }

    // Cleanup orphaned users if requested
    if (options?.cleanupOrphaned) {
      console.log('[SyncService] Cleaning up orphaned Neon users...');
      const allNeonUsers = await prisma.user.findMany({
        select: { id: true, clerkId: true, email: true },
      });

      for (const neonUser of allNeonUsers) {
        if (!clerkUserIds.has(neonUser.clerkId)) {
          console.log(`Deleting orphaned user: ${neonUser.email} (${neonUser.clerkId})`);
          
          // Delete user's related data first to avoid foreign key constraint violations
          // 1. Delete articles authored by this user
          await prisma.article.deleteMany({
            where: { authorId: neonUser.id }
          });
          
          // 2. Delete reviews by this user
          await prisma.review.deleteMany({
            where: { userId: neonUser.id }
          });
          
          // 3. Delete comments by this user
          await prisma.comment.deleteMany({
            where: { userId: neonUser.id }
          });
          
          // 4. Delete comparisons
          await prisma.comparison.deleteMany({
            where: { userId: neonUser.id }
          });
          
          // 5. Delete university claims
          await prisma.universityClaim.deleteMany({
            where: { userId: neonUser.id }
          });
          
          // 6. Delete referrals (as referrer or referred)
          await prisma.referral.deleteMany({
            where: { 
              OR: [
                { referrerId: neonUser.id },
                { referredUserId: neonUser.id }
              ]
            }
          });
          
          // 7. Delete notifications
          await prisma.notification.deleteMany({
            where: { userId: neonUser.id }
          });
          
          // 8. Delete user badges
          await prisma.userBadge.deleteMany({
            where: { userId: neonUser.id }
          });
          
          // 9. Delete financial profile (has CASCADE but being explicit)
          await prisma.financialProfile.deleteMany({
            where: { userId: neonUser.id }
          });
          
          // 10. Delete saved universities (has CASCADE but being explicit)
          await prisma.savedUniversity.deleteMany({
            where: { userId: neonUser.id }
          });
          
          // 11. Finally delete the user
          await prisma.user.delete({ where: { id: neonUser.id } });
          
          console.log(`  ✓ Deleted user and all related data: ${neonUser.email}`);
          deletedCount++;
        }
      }
    }
    
    console.log(`[SyncService] Reconciliation complete. Created: ${createdCount}, Updated: ${updatedCount}, Roles Synced: ${rolesSynced}, Deleted: ${deletedCount}`);
    return { created: createdCount, updated: updatedCount, rolesSynced, deleted: deletedCount };
  }
  
  /**
   * Health Check: Verifies data consistency between Neon and Clerk for a sample of users.
   */
  static async verifySyncStatus() {
    // Get all Neon users
    const neonUsers = await prisma.user.findMany({
      select: { id: true, clerkId: true, email: true, role: true },
    });

    // Get all Clerk users
    const clerkUsersResponse = await clerkClient.users.getUserList({ limit: 500 });
    const clerkUsers = clerkUsersResponse.data;
    
    const clerkUserMap = new Map(clerkUsers.map(u => [u.id, u]));
    const neonClerkIdSet = new Set(neonUsers.map(u => u.clerkId));
    
    let missingInNeon = 0;
    let missingInClerk = 0;
    let roleMismatches = 0;
    const sample: Array<{ clerkId: string; neonUser?: any; clerkUser?: any; issue?: string }> = [];

    // Check for users in Clerk but not in Neon
    for (const clerkUser of clerkUsers) {
      if (!neonClerkIdSet.has(clerkUser.id)) {
        missingInNeon++;
        if (sample.length < 5) {
          sample.push({
            clerkId: clerkUser.id,
            clerkUser: { email: clerkUser.emailAddresses[0]?.emailAddress },
            issue: `User exists in Clerk but not in Neon: ${clerkUser.emailAddresses[0]?.emailAddress}`,
          });
        }
      }
    }

    // Check for users in Neon but not in Clerk, and role mismatches
    for (const neonUser of neonUsers) {
      const clerkUser = clerkUserMap.get(neonUser.clerkId);
      
      if (!clerkUser) {
        missingInClerk++;
        if (sample.length < 5) {
          sample.push({
            clerkId: neonUser.clerkId,
            neonUser: { email: neonUser.email },
            issue: `User exists in Neon but not in Clerk: ${neonUser.email}`,
          });
        }
      } else {
        const clerkRole = (clerkUser.publicMetadata.role as string)?.toUpperCase() || 'USER';
        if (clerkRole !== neonUser.role) {
          roleMismatches++;
          if (sample.length < 5) {
            sample.push({
              clerkId: neonUser.clerkId,
              neonUser: { email: neonUser.email, role: neonUser.role },
              clerkUser: { role: clerkRole },
              issue: `Role mismatch for ${neonUser.email}: Neon=${neonUser.role}, Clerk=${clerkRole}`,
            });
          }
        }
      }
    }

    const healthy = missingInNeon === 0 && missingInClerk === 0 && roleMismatches === 0;

    return {
      healthy,
      missingInNeon,
      missingInClerk,
      roleMismatches,
      sample,
    };
  }

  /**
   * Orchestrates all daily synchronization and maintenance tasks.
   * This method should be called by a cron job or scheduled task runner.
   * 
   * Tasks performed:
   * 1. Recalculate derived metrics (Diversity Score, ROI Percentage)
   * 2. Archive/Remove expired soft content (announcements, deadlines)
   * 3. Full-Text Search Indexing (P29) - Soft Block text extraction and search vector building
   * 
   * NEW (Prompt 16): Core automated synchronization system for canonical data.
   * NEW (Prompt 29): Full-text search indexing integration.
   * 
   * @returns Promise resolves when all sync tasks are complete
   */
  static async runDailySync(): Promise<void> {
    console.log('[SyncService] Starting Daily Sync Service...');
    const startTime = Date.now();

    try {
      // Fetch only the necessary fields for calculation and identification
      const universities = await prisma.university.findMany({
        select: {
          id: true,
          slug: true,
          percentMale: true,
          percentFemale: true,
          percentInternational: true,
          tuitionOutState: true,
          alumniEarnings10Years: true,
        },
      });

      console.log(`[SyncService] Found ${universities.length} universities to process.`);

      // 1. Recalculate core derived metrics (Diversity, ROI)
      await this.recalculateUniversityMetrics(universities);

      // 2. Archive/Remove expired soft content (e.g., Announcements, Deadlines)
      await this.archiveExpiredMicroContent();

      // 3. NEW (P29): Full-Text Search Indexing - Index all soft block content
      await this.runSearchIndexing(universities.map(u => u.id));

      const duration = Date.now() - startTime;
      console.log(`[SyncService] Daily Sync Service completed in ${duration}ms.`);
    } catch (err) {
      console.error('[SyncService] Error during daily sync:', err);
      throw err;
    }
  }

  /**
   * Runs the full-text search indexer for all universities.
   * This task extracts text from Soft Blocks and builds search vectors
   * for improved full-text search discoverability.
   * 
   * Batch processing is used to avoid database connection pool exhaustion.
   * Individual failures do not stop the entire process.
   * 
   * @param universityIds Array of university IDs to index
   */
  private static async runSearchIndexing(universityIds: string[]): Promise<void> {
    console.log('[SyncService] Starting Full-Text Search Indexing...');
    
    try {
      const { SearchIndexingService } = await import('./SearchIndexingService');
      
      // Batch indexing for high efficiency (10 at a time)
      const results = await SearchIndexingService.indexMultipleUniversities(universityIds, 10);
      
      console.log(`[SyncService] Search Indexing completed. Succeeded: ${results.succeeded}, Failed: ${results.failed}`);
      
      if (results.errors.length > 0) {
        console.warn('[SyncService] Search Indexing errors:', results.errors);
      }
    } catch (err) {
      console.error('[SyncService] Error during search indexing:', err);
      // Do not re-throw, allow sync to continue
    }
  }


  /**
   * Recalculates derived scalar fields (Diversity Score, ROI Percentage) for all universities.
   * 
   * Diversity Score: Combines demographic balance (male/female) and international population.
   * - Range: 0 to 1
   * - Formula: (1 - demographicVariance) * 0.7 + international * 0.3
   * - Higher score = more diverse student body
   * 
   * ROI Percentage: Return on Investment for alumni earnings vs tuition cost.
   * - Calculated as: ((Total Earnings after 10 years - 4-year Cost) / 4-year Cost) * 100
   * - Positive = good investment, Negative = poor investment
   * 
   * @param universities Array of universities with demographic and financial data
   */
  private static async recalculateUniversityMetrics(universities: any[]): Promise<void> {
    console.log(`[SyncService] Recalculating metrics for ${universities.length} universities...`);

    let updatedCount = 0;
    const errors: Array<{ universityId: string; error: string }> = [];

    for (const uni of universities) {
      try {
        const updateData: Record<string, any> = {};

        // ============================================================
        // 1. DIVERSITY SCORE Calculation (0 to 1)
        // ============================================================
        // Combines:
        // - Gender balance (70% weight): how close to 50/50 male/female split
        // - International population (30% weight): percentage of international students

        const percentMale = uni.percentMale ?? 0.5;
        const percentFemale = uni.percentFemale ?? 0.5;
        const international = uni.percentInternational ?? 0;

        // Calculate variance from ideal (0.5 male/female)
        // If one is 0.6, other is 0.4, variance = 0.1 + 0.1 = 0.2 (less diverse)
        // If both are 0.5, variance = 0 (perfectly balanced)
        const demographicVariance = Math.abs(percentMale - 0.5) + Math.abs(percentFemale - 0.5);

        // Combine gender balance (70%) and international representation (30%)
        // Result scaled to 0-1 range, then converted to 0-100 percentage
        const diversityScore = Math.round((1 - demographicVariance) * 0.7 + international * 0.3) / 100;
        updateData.diversityScore = diversityScore;

        // ============================================================
        // 2. ROI PERCENTAGE Calculation
        // ============================================================
        // Helps students understand financial return on education investment
        // Formula: ((Total Earnings after 10 years - 4-year Cost) / 4-year Cost) * 100

        const earnings = uni.alumniEarnings10Years;
        const cost = uni.tuitionOutState;

        if (earnings && cost && cost > 0) {
          // 4-year total cost = annual tuition * 4
          const fourYearCost = cost * 4;

          // Net gain = total earnings - cost invested
          const netGain = earnings - fourYearCost;

          // ROI = (net gain / cost invested) * 100
          const roi = (netGain / fourYearCost) * 100;

          // Round to 2 decimal places
          updateData.ROIPercentage = Math.round(roi * 100) / 100;
        }

        // ============================================================
        // 3. Update Database if metrics changed
        // ============================================================
        if (Object.keys(updateData).length > 0) {
          await prisma.university.update({
            where: { id: uni.id },
            data: updateData,
          });

          updatedCount++;

          // Crucial for freshness: invalidate the profile cache
          // This ensures the next request gets fresh calculated data
          const { UniversityProfileService } = await import('./UniversityProfileService');
          await UniversityProfileService.invalidateProfileCache(uni.slug);
        }
      } catch (err) {
        errors.push({
          universityId: uni.id || 'unknown',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    console.log(
      `[SyncService] Updated metrics for ${updatedCount} universities. Errors: ${errors.length}`
    );

    if (errors.length > 0) {
      console.error('[SyncService] Metric calculation errors:', errors);
    }
  }

  /**
   * Cleans up MicroContent blocks (announcements, deadlines) that have passed their expiresAt date.
   * 
   * Archived blocks:
   * - Set isActive = false (soft delete)
   * - Prepend "[ARCHIVED]" to title for visibility
   * - Trigger cache invalidation for affected universities
   * 
   * Note: This handles expiration for soft-content blocks that have time-based expiration.
   * Hard blocks (canonical data) are not affected by this cleanup.
   */
  private static async archiveExpiredMicroContent(): Promise<void> {
    const now = new Date();

    try {
      // Find blocks that are likely to have expiration (announcement/deadline types)
      // These are soft-content blocks with potentially embedded expiresAt dates in their JSON data
      const potentiallyExpiredBlocks = await prisma.microContent.findMany({
        where: {
          blockType: { in: ['deadline_card', 'announcement_banner'] },
          isActive: true,
        },
        include: {
          university: { select: { slug: true } },
        },
      });

      const slugsToInvalidate = new Set<string>();
      let archivedCount = 0;

      // Check each block's data for expiresAt field
      for (const block of potentiallyExpiredBlocks) {
        const blockData = block.data as Record<string, any> | null;
        const expiresAt = blockData?.expiresAt as string | undefined;

        // If block has expiresAt and it's in the past, archive it
        if (expiresAt) {
          const expirationDate = new Date(expiresAt);

          if (expirationDate < now) {
            // Archive the block (soft delete)
            await prisma.microContent.update({
              where: { id: block.id },
              data: {
                isActive: false,
                title: `[ARCHIVED] ${block.title}`,
              },
            });

            slugsToInvalidate.add(block.university.slug);
            archivedCount++;
          }
        }
      }

      // Invalidate cache only for affected universities
      for (const slug of slugsToInvalidate) {
        const { UniversityProfileService } = await import('./UniversityProfileService');
        await UniversityProfileService.invalidateProfileCache(slug);
      }

      console.log(
        `[SyncService] Archived ${archivedCount} expired micro-content blocks. ` +
        `Cache invalidated for ${slugsToInvalidate.size} universities.`
      );
    } catch (err) {
      console.error('[SyncService] Error archiving expired content:', err);
      throw err;
    }
  }
}
