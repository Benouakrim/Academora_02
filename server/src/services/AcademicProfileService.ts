import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class AcademicProfileService {
  /**
   * Initialize an academic profile for a user with default values.
   * Can be called automatically during onboarding or when user first accesses academic features.
   */
  static async initializeAcademicProfile(userId: string) {
    try {
      // Check if profile already exists
      const existing = await prisma.academicProfile.findUnique({
        where: { userId },
      });

      if (existing) {
        return existing;
      }

      // Create a new academic profile with empty values
      const academicProfile = await prisma.academicProfile.create({
        data: {
          userId,
          // All fields remain null/undefined for user to fill later
        },
      });

      console.log(`[AcademicProfileService] Initialized academic profile for user ${userId}`);
      return academicProfile;
    } catch (error: any) {
      console.error('[AcademicProfileService] Failed to initialize profile:', error);
      throw new AppError(500, 'Failed to initialize academic profile');
    }
  }

  /**
   * Upsert (create or update) an AcademicProfile for a user identified by clerkId.
   * This method first resolves the internal userId from the clerkId,
   * then uses Prisma's upsert to either create or update the single related record.
   */
  static async upsert(
    clerkId: string,
    data: Partial<Omit<Prisma.AcademicProfileUncheckedCreateInput, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) {
    // Find the user by clerkId to get the internal userId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Filter out undefined values (but keep null to allow explicit clearing)
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    try {
      // Upsert the AcademicProfile (1:1 relation)
      const academicProfile = await prisma.academicProfile.upsert({
        where: { userId: user.id },
        update: cleanData,
        create: {
          userId: user.id,
          ...cleanData,
        },
      });

      return academicProfile;
    } catch (err: any) {
      console.error('[AcademicProfileService] Failed to upsert:', err);
      throw new AppError(400, 'Failed to upsert academic profile');
    }
  }

  /**
   * Get the AcademicProfile for a user by clerkId
   */
  static async getByClerkId(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const profile = await prisma.academicProfile.findUnique({
      where: { userId: user.id },
    });

    return profile;
  }

  /**
   * Get the AcademicProfile for a user by internal userId
   */
  static async getByUserId(userId: string) {
    const profile = await prisma.academicProfile.findUnique({
      where: { userId },
    });

    return profile;
  }

  /**
   * Delete an AcademicProfile (rarely used, but available for completeness)
   */
  static async delete(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    try {
      await prisma.academicProfile.delete({
        where: { userId: user.id },
      });

      return { success: true };
    } catch (err: any) {
      // Profile might not exist
      if (err.code === 'P2025') {
        throw new AppError(404, 'Academic profile not found');
      }
      throw new AppError(500, 'Failed to delete academic profile');
    }
  }

  /**
   * Get academic profiles matching specific criteria (useful for admin/matching engine)
   * @param filters - Optional filters for querying profiles
   */
  static async query(filters?: {
    gradYear?: number;
    minGpa?: number;
    maxGpa?: number;
    primaryMajor?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.AcademicProfileWhereInput = {};

    if (filters?.gradYear) {
      where.gradYear = filters.gradYear;
    }

    if (filters?.minGpa !== undefined || filters?.maxGpa !== undefined) {
      where.gpa = {};
      if (filters.minGpa !== undefined) {
        where.gpa.gte = filters.minGpa;
      }
      if (filters.maxGpa !== undefined) {
        where.gpa.lte = filters.maxGpa;
      }
    }

    if (filters?.primaryMajor) {
      where.primaryMajor = {
        contains: filters.primaryMajor,
        mode: 'insensitive',
      };
    }

    const profiles = await prisma.academicProfile.findMany({
      where,
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return profiles;
  }

  /**
   * Calculate a completeness score for an academic profile (0-100%)
   * Useful for encouraging users to fill out their profiles
   */
  static calculateCompleteness(profile: any): number {
    if (!profile) return 0;

    const fields = [
      'gpa',
      'gpaScale',
      'testScores',
      'highSchoolName',
      'gradYear',
      'primaryMajor',
      'extracurriculars',
      'academicHonors',
    ];

    let filledFields = 0;
    const totalFields = fields.length;

    fields.forEach((field) => {
      const value = profile[field];
      
      // Check if field has meaningful data
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          if (value.length > 0) filledFields++;
        } else if (typeof value === 'object') {
          if (Object.keys(value).length > 0) filledFields++;
        } else {
          filledFields++;
        }
      }
    });

    return Math.round((filledFields / totalFields) * 100);
  }

  /**
   * Get profile with computed completeness score
   */
  static async getProfileWithCompleteness(clerkId: string) {
    const profile = await this.getByClerkId(clerkId);
    
    if (!profile) {
      return null;
    }

    return {
      ...profile,
      completeness: this.calculateCompleteness(profile),
    };
  }
}
