import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/express';
import { AppError } from '../utils/AppError';
import { SyncService } from './SyncService';
import { FinancialProfileService } from './FinancialProfileService';
import type { OnboardingPayload, IndividualAnswers, OrganizationAnswers } from '../validation/onboardingSchemas';

const prisma = new PrismaClient();

export class OnboardingService {
  /**
   * Ensures the User exists in the local database before processing onboarding.
   * Handles Clerk race condition by fetching from Clerk SDK and creating the user if needed.
   */
  private static async ensureUserExists(clerkId: string): Promise<string> {
    // Check if user exists in local DB
    let user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (user) {
      return user.id;
    }

    // User doesn't exist locally - fetch from Clerk and create
    console.log(`[OnboardingService] User ${clerkId} not found locally. Fetching from Clerk...`);
    
    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      
      const primaryEmail = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;

      if (!primaryEmail) {
        throw new AppError(400, 'No primary email found for Clerk user');
      }

      // Create the user in local DB
      const newUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: primaryEmail,
          firstName: clerkUser.firstName || undefined,
          lastName: clerkUser.lastName || undefined,
          avatarUrl: clerkUser.imageUrl || undefined,
          role: 'USER', // Default role
        },
      });

      console.log(`[OnboardingService] Created user ${clerkId} in local DB`);
      return newUser.id;
    } catch (error: any) {
      if (error.status === 404) {
        throw new AppError(404, 'User not found in Clerk');
      }
      throw new AppError(500, `Failed to sync user from Clerk: ${error.message}`);
    }
  }

  /**
   * Derives relational fields from the answers object based on account type.
   * This extracts the structured data that should be stored in User table columns.
   */
  private static deriveRelationalUpdates(
    accountType: string,
    answers: IndividualAnswers | OrganizationAnswers
  ): {
    accountType: string;
    personaRole?: string;
    focusArea?: string;
    primaryGoal?: string;
    organizationName?: string;
  } {
    const updates: any = { accountType };

    if (accountType === 'INDIVIDUAL') {
      const individualAnswers = answers as IndividualAnswers;
      updates.personaRole = individualAnswers.personaRole;
      updates.focusArea = individualAnswers.focusArea;
      updates.primaryGoal = individualAnswers.primaryGoal;
    } else if (accountType === 'ORGANIZATION') {
      const organizationAnswers = answers as OrganizationAnswers;
      updates.organizationName = organizationAnswers.organizationName;
    }

    return updates;
  }

  /**
   * Completes the onboarding process for a user.
   * Handles Clerk race condition, transforms data, and stores in both relational and JSONB fields.
   */
  static async completeOnboarding(clerkId: string, data: OnboardingPayload) {
    // Step 1: Ensure user exists (handle Clerk race condition)
    const userId = await this.ensureUserExists(clerkId);

    // Step 2: Check if user has already completed onboarding
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboarded: true },
    });

    if (existingUser?.onboarded) {
      throw new AppError(400, 'User has already completed onboarding');
    }

    // Step 3: Derive relational updates from answers
    const relationalUpdates = this.deriveRelationalUpdates(
      data.accountType,
      data.answers
    );

    // Step 4: Prepare the full onboarding answers payload for JSONB storage
    const onboardingAnswers = {
      accountType: data.accountType,
      answers: data.answers,
      version: data.version || '1.0',
      completedAt: data.completedAt || new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };

    // Step 5: Execute Prisma transaction to update user
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update the user with both relational fields and JSONB data
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          onboarded: true,
          onboardingSkipped: false,
          ...relationalUpdates,
          onboardingAnswers: onboardingAnswers,
        },
        include: {
          financialProfile: true,
          savedUniversities: {
            include: {
              university: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
      });

      return user;
    });

    // Step 6: Auto-initialize Financial Profile if primaryGoal is FIND_FINANCIAL_AID
    if (relationalUpdates.primaryGoal === 'FIND_FINANCIAL_AID') {
      try {
        await FinancialProfileService.initializeFinancialProfile(userId);
        console.log(`[OnboardingService] Auto-initialized financial profile for user ${clerkId}`);
      } catch (error) {
        console.error('[OnboardingService] Failed to auto-initialize financial profile:', error);
        // Don't fail the entire onboarding if this fails
      }
    }

    // Step 7: Activity logging for analytics
    console.log('[OnboardingService] ONBOARDING_COMPLETED', {
      userId,
      clerkId,
      accountType: data.accountType,
      personaRole: relationalUpdates.personaRole,
      focusArea: relationalUpdates.focusArea,
      primaryGoal: relationalUpdates.primaryGoal,
      organizationName: relationalUpdates.organizationName,
      timestamp: new Date().toISOString(),
    });

    // Step 8: Sync updated data back to Clerk metadata
    try {
      await SyncService.syncNeonToClerk(userId);
    } catch (syncError) {
      console.error('[OnboardingService] Failed to sync to Clerk:', syncError);
      // Don't fail the entire operation if Clerk sync fails
    }

    console.log(`[OnboardingService] Onboarding completed for user ${clerkId}`);
    
    return updatedUser;
  }

  /**
   * Retrieves the onboarding status for a user.
   */
  static async getOnboardingStatus(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        onboarded: true,
        onboardingSkipped: true,
        accountType: true,
        personaRole: true,
        focusArea: true,
        primaryGoal: true,
        organizationName: true,
        onboardingAnswers: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  /**
   * Allows users to skip onboarding.
   */
  static async skipOnboarding(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, onboarded: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.onboarded) {
      throw new AppError(400, 'User has already completed onboarding');
    }

    // Update user to mark onboarding as skipped
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        onboarded: false,
        onboardingSkipped: true,
      },
      select: {
        id: true,
        clerkId: true,
        onboarded: true,
        onboardingSkipped: true,
      },
    });

    console.log(`[OnboardingService] User ${clerkId} skipped onboarding`);

    return updatedUser;
  }

  /**
   * Allows users to update their onboarding data (re-onboarding).
   */
  static async updateOnboarding(clerkId: string, data: OnboardingPayload) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Derive relational updates
    const relationalUpdates = this.deriveRelationalUpdates(
      data.accountType,
      data.answers
    );

    // Prepare updated onboarding answers
    const onboardingAnswers = {
      accountType: data.accountType,
      answers: data.answers,
      version: data.version || '1.0',
      completedAt: data.completedAt || new Date().toISOString(),
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...relationalUpdates,
        onboardingAnswers: onboardingAnswers,
      },
      include: {
        financialProfile: true,
      },
    });

    // Sync to Clerk
    try {
      await SyncService.syncNeonToClerk(user.id);
    } catch (syncError) {
      console.error('[OnboardingService] Failed to sync to Clerk:', syncError);
    }

    return updatedUser;
  }
}
