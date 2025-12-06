import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

export const requireAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const getAuth = (req as any).auth as (() => any | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;

    console.log('[requireAdmin] Auth check:', {
      hasAuthFn: typeof getAuth === 'function',
      authResult: auth,
      userId: auth?.userId
    });

    if (!auth || !auth.userId) {
      throw new AppError(401, 'Unauthorized: Please log in');
    }

    // Source of truth: query DB for user role by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
      select: { role: true, email: true },
    });

    console.log('[requireAdmin] User lookup:', {
      clerkId: auth.userId,
      found: !!user,
      role: user?.role,
      email: user?.email
    });

    if (!user || user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Forbidden: Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
