import { clerkMiddleware, requireAuth as clerkRequireAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import dotenv from 'dotenv';

// Ensure env vars are loaded
dotenv.config();

// Export Clerk middleware for auth context (should be mounted globally)
// Explicitly pass keys to ensure they are picked up correctly
export const clerkAuth = clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY
});

// Require auth for protected routes, respond with 401 JSON if missing
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Clerk middleware attaches `req.auth` as an object; support both object and getter function forms.
  const authSource = (req as any).auth as any;
  const auth = typeof authSource === 'function' ? authSource() : authSource;
  
  console.log('[requireAuth] Authentication check:', {
    url: req.url,
    method: req.method,
    hasAuthSource: !!authSource,
    authType: typeof authSource,
    hasAuth: !!auth,
    userId: auth?.userId || 'none',
    hasAuthHeader: !!req.headers.authorization,
    authHeaderPrefix: req.headers.authorization?.substring(0, 20)
  });
  
  if (!auth || !auth.userId) {
    console.error('[requireAuth] ❌ Authentication failed:', {
      url: req.url,
      reason: !auth ? 'No auth object' : 'No userId in auth',
      authObject: auth
    });
    return res.status(401).json({ 
      error: 'unauthenticated',
      message: 'Authentication required. Please sign in.',
      details: process.env.NODE_ENV === 'development' ? {
        hasAuthObject: !!auth,
        hasUserId: !!auth?.userId,
        authKeys: auth ? Object.keys(auth) : []
      } : undefined
    });
  }
  
  console.log('[requireAuth] ✅ Authentication successful for user:', auth.userId);
  next();
};

// Require admin role for protected routes
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
  const auth = typeof getAuth === 'function' ? getAuth() : undefined;
  
  console.log('[requireAdmin] Admin check:', {
    url: req.url,
    hasAuth: !!auth,
    userId: auth?.userId || 'none'
  });
  
  if (!auth || !auth.userId) {
    console.error('[requireAdmin] ❌ No authentication');
    return res.status(401).json({ error: 'unauthenticated' });
  }

  try {
    // Check if user has admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      console.error('[requireAdmin] ❌ User is not admin:', {
        userId: auth.userId,
        hasUser: !!user,
        role: user?.role
      });
      return res.status(403).json({ error: 'forbidden', message: 'Admin access required' });
    }

    console.log('[requireAdmin] ✅ Admin access granted');
    next();
  } catch (error) {
    console.error('[requireAdmin] ❌ Database error:', error);
    return res.status(500).json({ error: 'internal_server_error' });
  }
};

// Fallback auth middleware if Clerk is not configured
export const optionalAuth = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};
