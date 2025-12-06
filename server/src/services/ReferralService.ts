import { randomBytes } from 'crypto';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

/**
 * Service for managing referral codes and tracking referral relationships
 */
export class ReferralService {
  /**
   * Generate a unique, URL-safe referral code
   * @returns A unique 8-character referral code
   */
  static async generateUniqueCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Generate 6 random bytes, convert to base64url, take first 8 chars
      const code = randomBytes(6)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
        .substring(0, 8)
        .toUpperCase();

      // Check if code already exists
      const existing = await prisma.user.findUnique({
        where: { referralCode: code },
        select: { id: true },
      });

      if (!existing) {
        return code;
      }

      attempts++;
    }

    throw new AppError(500, 'Failed to generate unique referral code');
  }

  /**
   * Ensure a user has a referral code, generating one if needed
   * @param userId - The user's database ID
   * @returns The user's referral code
   */
  static async ensureReferralCode(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // If user already has a code, return it
    if (user.referralCode) {
      return user.referralCode;
    }

    // Generate and save new code
    const newCode = await this.generateUniqueCode();
    
    await prisma.user.update({
      where: { id: userId },
      data: { referralCode: newCode },
    });

    return newCode;
  }

  /**
   * Track a referral relationship when a new user signs up with a referral code
   * @param referredByCode - The referral code used during signup
   * @param newUserId - The ID of the newly registered user
   * @returns The created referral record or null if invalid
   */
  static async trackReferral(referredByCode: string, newUserId: string) {
    // Find the referrer by their code
    const referrer = await prisma.user.findUnique({
      where: { referralCode: referredByCode },
      select: { id: true },
    });

    if (!referrer) {
      throw new AppError(404, 'Invalid referral code');
    }

    // Prevent self-referral
    if (referrer.id === newUserId) {
      throw new AppError(400, 'Cannot refer yourself');
    }

    // Check if referral relationship already exists
    const existingReferral = await prisma.referral.findUnique({
      where: {
        referredUserId: newUserId,
      },
    });

    if (existingReferral) {
      // Already tracked, return existing
      return existingReferral;
    }

    // Create new referral record
    const referral = await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredUserId: newUserId,
        status: 'PENDING',
      },
      include: {
        referredUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    console.log(`✅ Referral tracked: ${referrer.id} referred ${newUserId}`);

    return referral;
  }

  /**
   * Get all referrals made by a specific user
   * @param userId - The referrer's user ID
   * @returns Array of referral records with referred user details
   */
  static async getReferralsByUserId(userId: string) {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referredUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return referrals;
  }

  /**
   * Get referral statistics for a user
   * @param userId - The user's ID
   * @returns Stats object with counts
   */
  static async getReferralStats(userId: string) {
    const [total, pending, completed] = await Promise.all([
      prisma.referral.count({ where: { referrerId: userId } }),
      prisma.referral.count({ where: { referrerId: userId, status: 'PENDING' } }),
      prisma.referral.count({ where: { referrerId: userId, status: 'COMPLETED' } }),
    ]);

    return {
      total,
      pending,
      completed,
    };
  }

  /**
   * Mark a referral as completed (e.g., when referred user completes onboarding)
   * @param referralId - The referral record ID
   */
  static async completeReferral(referralId: string) {
    const referral = await prisma.referral.update({
      where: { id: referralId },
      data: {
        status: 'COMPLETED',
      },
    });

    console.log(`✅ Referral completed: ${referralId}`);

    return referral;
  }
}
