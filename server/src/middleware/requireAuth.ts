import { clerkMiddleware } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';

// Export Clerk middleware for auth context (should be mounted globally)
export const clerkAuth = clerkMiddleware();

// Require auth for protected routes, respond with 401 JSON if missing
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
  const auth = typeof getAuth === 'function' ? getAuth() : undefined;
  if (!auth || !auth.userId) {
    return res.status(401).json({ error: 'unauthenticated' });
  }
  next();
};

// Fallback auth middleware if Clerk is not configured
export const optionalAuth = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};
