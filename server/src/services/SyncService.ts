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
}
