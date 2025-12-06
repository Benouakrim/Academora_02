import { UserRole } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { NotificationService } from './NotificationService';
import prisma from '../lib/prisma';

export class BadgeService {

  /**
   * Awards a specific badge to a user, ensuring no duplicates.
   * Also sends a notification for the achievement.
   * @param userId The ID of the user to award the badge to.
   * @param badgeSlug The unique slug of the badge (e.g., 'early-bird').
   * @returns The newly created UserBadge or the existing one.
   */
  static async awardBadge(userId: string, badgeSlug: string) {
    // 1. Find the badge data
    const badge = await prisma.badge.findUnique({
      where: { slug: badgeSlug },
    });

    if (!badge) {
      console.warn(`[BadgeService] Badge with slug ${badgeSlug} not found. Skipping award.`);
      return null;
    }

    // 2. Check for duplicate award
    const existingAward = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId: userId,
          badgeId: badge.id,
        },
      },
    });

    if (existingAward) {
      return existingAward; // Already awarded, do nothing
    }

    // 3. Create the UserBadge record
    const newAward = await prisma.userBadge.create({
      data: {
        userId: userId,
        badgeId: badge.id,
      },
    });

    // 4. Send Notification
    await NotificationService.create(userId, {
      type: 'ACHIEVEMENT',
      title: '🎉 New Achievement Unlocked!',
      message: `You earned the '${badge.name}' badge for: ${badge.description}`,
      link: '/dashboard/profile?tab=badges', // Future link to badge profile
    }).catch(console.error);

    console.log(`[BadgeService] Awarded badge '${badge.name}' to user ${userId}`);
    return newAward;
  }

  /**
   * Retrieves all badges awarded to a specific user.
   */
  static async getUserBadges(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { awardedAt: 'desc' },
    });
  }

  /**
   * Retrieves all defined badges for display.
   */
  static async getAllBadges() {
    return prisma.badge.findMany({
      orderBy: { category: 'asc', name: 'asc' },
    });
  }
}
