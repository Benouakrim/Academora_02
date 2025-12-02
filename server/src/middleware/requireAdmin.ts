import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export const requireAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const getAuth = (req as any).auth as (() => any | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;

    if (!auth || !auth.userId) {
      throw new AppError(401, 'Unauthorized: Please log in');
    }

    // Source of truth: query DB for user role by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
      select: { role: true },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Forbidden: Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
