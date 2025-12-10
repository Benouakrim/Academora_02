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
    // Clerk attaches `req.auth` as an object. Some contexts may expose it as a function.
    // Support both so authenticated admins are not treated as anonymous users.
    const authSource = (req as any).auth as any;
    const auth = typeof authSource === 'function' ? authSource() : authSource;

    console.log('[requireAdmin] Auth check:', {
      hasAuthFn: typeof authSource === 'function',
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
