import { clerkMiddleware, requireAuth as clerkRequireAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// Export Clerk middleware for auth context (should be mounted globally)
export const clerkAuth = clerkMiddleware();

// Require auth for protected routes, respond with 401 JSON if missing
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
  const auth = typeof getAuth === 'function' ? getAuth() : undefined;
  
  console.log('[requireAuth] Check:', {
    hasAuthFn: typeof getAuth === 'function',
    auth,
    userId: auth?.userId
  });
  
  if (!auth || !auth.userId) {
    return res.status(401).json({ error: 'unauthenticated' });
  }
  next();
};

// Require admin role for protected routes
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
  const auth = typeof getAuth === 'function' ? getAuth() : undefined;
  
  if (!auth || !auth.userId) {
    return res.status(401).json({ error: 'unauthenticated' });
  }

  try {
    // Check if user has admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'forbidden', message: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('[requireAdmin] Error:', error);
    return res.status(500).json({ error: 'internal_server_error' });
  }
};

// Fallback auth middleware if Clerk is not configured
export const optionalAuth = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};
