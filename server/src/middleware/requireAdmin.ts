import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/express';
import { AppError } from '../utils/AppError';

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

    const claims = auth.sessionClaims || {};
    let userRole = claims?.metadata?.role || claims?.publicMetadata?.role;

    if (!userRole) {
      // Fallback: fetch user from Clerk to read publicMetadata
      const user = await clerkClient.users.getUser(auth.userId);
      userRole = (user.publicMetadata as any)?.role as string | undefined;
    }

    if (userRole !== 'admin') {
      throw new AppError(403, 'Forbidden: Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
