import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class UserService {
  static async getProfile(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        savedUniversities: {
          include: { university: true },
        },
      },
    });
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  static async updateProfile(clerkId: string, data: any) {
    // Directly update permitted fields; validation ensures shape
    const updated = await prisma.user.update({
      where: { clerkId },
      data,
    });
    return updated;
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
