import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

export class FinancialProfileService {
  /**
   * Initialize a financial profile for a user with default values.
   * Called automatically when user's primaryGoal is FIND_FINANCIAL_AID.
   */
  static async initializeFinancialProfile(userId: string) {
    try {
      // Check if profile already exists
      const existing = await prisma.financialProfile.findUnique({
        where: { userId },
      });

      if (existing) {
        return existing;
      }

      // Create a new financial profile with default/empty values
      const financialProfile = await prisma.financialProfile.create({
        data: {
          userId,
          maxBudget: 50000, // Default budget
          // All other fields remain null/undefined for user to fill later
        },
      });

      console.log(`[FinancialProfileService] Initialized financial profile for user ${userId}`);
      return financialProfile;
    } catch (error: any) {
      console.error('[FinancialProfileService] Failed to initialize profile:', error);
      throw new AppError(500, 'Failed to initialize financial profile');
    }
  }

  /**
   * Upsert (create or update) a FinancialProfile for a user identified by clerkId.
   * This method first resolves the internal userId from the clerkId,
   * then uses Prisma's upsert to either create or update the single related record.
   */
  static async upsert(
    clerkId: string,
    data: Partial<Omit<Prisma.FinancialProfileUncheckedCreateInput, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) {
    // Find the user by clerkId to get the internal userId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Filter out undefined/null values to avoid overwriting with null
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null)
    );

    try {
      // Upsert the FinancialProfile (1:1 relation)
      const financialProfile = await prisma.financialProfile.upsert({
        where: { userId: user.id },
        update: cleanData,
        create: {
          userId: user.id,
          ...cleanData,
        },
      });

      return financialProfile;
    } catch (err) {
      throw new AppError(400, 'Failed to upsert financial profile');
    }
  }

  /**
   * Get the FinancialProfile for a user by clerkId
   */
  static async getByClerkId(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const profile = await prisma.financialProfile.findUnique({
      where: { userId: user.id },
    });

    return profile;
  }
}
