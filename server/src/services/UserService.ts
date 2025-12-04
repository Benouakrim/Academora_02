import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { ReferralService } from './ReferralService';

const prisma = new PrismaClient();

export class UserService {
  static async getProfile(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        financialProfile: true,
        savedUniversities: {
          include: { 
            university: {
              select: {
                id: true,
                name: true,
                slug: true,
                city: true,
                state: true,
                country: true,
                logoUrl: true,
                tuitionOutState: true,
                tuitionInternational: true,
              }
            } 
          },
          orderBy: { createdAt: 'desc' }
        },
      },
    });
    if (!user) throw new AppError(404, 'User not found');
    
    // Ensure user has a referral code
    await ReferralService.ensureReferralCode(user.id);
    
    // Refetch user to include the referral code in response
    const updatedUser = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        financialProfile: true,
        savedUniversities: {
          include: { 
            university: {
              select: {
                id: true,
                name: true,
                slug: true,
                city: true,
                state: true,
                country: true,
                logoUrl: true,
                tuitionOutState: true,
                tuitionInternational: true,
              }
            } 
          },
          orderBy: { createdAt: 'desc' }
        },
      },
    });
    
    return updatedUser;
  }

  static async updateProfile(clerkId: string, data: any) {
    // Define allowed fields for profile updates
    const allowedFields = [
      // Basic Info
      'firstName',
      'lastName',
      // Academic Stats
      'gpa',
      'satScore',
      'actScore',
      'preferredMajor',
      // Onboarding relational fields
      'accountType',
      'personaRole',
      'focusArea',
      'primaryGoal',
      'organizationName',
      // Extended Profile
      'dreamJobTitle',
      'careerGoals',
      'hobbies',
      'languagesSpoken',
      'preferredLearningStyle',
      'personalityType',
    ];

    // Filter to only allowed fields and remove undefined/null/empty values
    const cleanData = Object.fromEntries(
      Object.entries(data)
        .filter(([key, v]) => allowedFields.includes(key) && v !== undefined && v !== null && v !== '')
    );

    try {
      const updated = await prisma.user.update({
        where: { clerkId },
        data: cleanData,
      });
      
      console.log(`[UserService] Profile updated for user ${clerkId}`, Object.keys(cleanData));
      return updated;
    } catch (err) {
      console.error('[UserService] Failed to update profile:', err);
      throw new AppError(400, 'Failed to update profile');
    }
  }

  static async toggleSavedUniversity(clerkId: string, universityId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new AppError(404, 'User not found');

    const existing = await prisma.savedUniversity.findUnique({
      where: { userId_universityId: { userId: user.id, universityId } },
    });

    if (existing) {
      await prisma.savedUniversity.delete({ where: { id: existing.id } });
      return { status: 'removed' };
    }

    await prisma.savedUniversity.create({
      data: { userId: user.id, universityId },
    });
    return { status: 'added' };
  }
}
