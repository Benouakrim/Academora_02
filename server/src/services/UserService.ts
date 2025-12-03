import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

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
    return user;
  }

  static async updateProfile(clerkId: string, data: any) {
    // Filter out undefined/null values to avoid overwriting with null
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );

    try {
      const updated = await prisma.user.update({
        where: { clerkId },
        data: cleanData,
      });
      return updated;
    } catch (err) {
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
