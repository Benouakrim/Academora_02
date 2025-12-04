import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Feature access control middleware
 * Protects routes based on user role and feature flags
 * 
 * @param feature - Feature identifier (e.g., 'ADVANCED_ANALYTICS', 'COMPARISON_LIMIT')
 * @returns Express middleware function
 * 
 * @example
 * router.post('/match', requireAuth, requireFeatureAccess('ADVANCED_MATCHING'), calculateMatches);
 */
export function requireFeatureAccess(feature: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract user ID from Clerk auth context
      const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
      const auth = typeof getAuth === 'function' ? getAuth() : undefined;
      
      if (!auth || !auth.userId) {
        return res.status(401).json({ 
          error: 'unauthenticated',
          message: 'You must be logged in to access this feature'
        });
      }

      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { clerkId: auth.userId },
        select: { 
          id: true, 
          clerkId: true, 
          role: true,
          email: true
        }
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'user_not_found',
          message: 'User account not found'
        });
      }

      // Attach user plan/role to request for downstream usage (e.g., result restrictions)
      (req as any).userPlan = user.role;
      (req as any).userId = user.id;

      // MVP Logic: Admin users have access to all features
      if (user.role === 'ADMIN') {
        console.log(`[FeatureAccess] ✅ Admin access granted: ${feature} for user ${user.email}`);
        return next();
      }

      // Future expansion: Check feature flags in database
      // const hasAccess = await prisma.userFeature.findFirst({
      //   where: {
      //     userId: user.id,
      //     feature: feature,
      //     enabled: true,
      //     expiresAt: { gt: new Date() } // Optional: time-limited access
      //   }
      // });
      // if (hasAccess) return next();

      // Default: Deny access for non-admin users
      console.log(`[FeatureAccess] ❌ Access denied: ${feature} for user ${user.email} (role: ${user.role})`);
      
      return res.status(403).json({ 
        error: 'feature_access_denied',
        message: `This feature is only available to premium users. Feature: ${feature}`,
        feature,
        upgradeUrl: '/pricing' // Frontend route for upgrade
      });

    } catch (error) {
      console.error('[FeatureAccess] Error checking feature access:', error);
      return res.status(500).json({ 
        error: 'internal_error',
        message: 'Failed to verify feature access'
      });
    }
  };
}

/**
 * Feature flags enum for type safety
 * Add new features here as they are developed
 */
export enum Feature {
  ADVANCED_MATCHING = 'ADVANCED_MATCHING',
  ADVANCED_ANALYTICS = 'ADVANCED_ANALYTICS',
  COMPARISON_LIMIT = 'COMPARISON_LIMIT',
  BULK_EXPORT = 'BULK_EXPORT',
  PRIORITY_SUPPORT = 'PRIORITY_SUPPORT',
  API_ACCESS = 'API_ACCESS',
}

/**
 * Optional authentication middleware for public endpoints with tiered access
 * Attaches user plan if authenticated, otherwise marks as anonymous
 * Used for features like university discovery that have different limits based on auth status
 */
export async function attachUserPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    
    if (!auth || !auth.userId) {
      // Anonymous user - attach default plan
      (req as any).userPlan = 'FREE';
      (req as any).isAnonymous = true;
      console.log('[UserPlan] Anonymous user detected - applying FREE tier restrictions');
      return next();
    }

    // Authenticated user - fetch their plan
    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
      select: { 
        id: true,
        role: true,
        email: true
      }
    });

    if (user) {
      (req as any).userPlan = user.role;
      (req as any).userId = user.id;
      (req as any).isAnonymous = false;
      console.log(`[UserPlan] Authenticated user: ${user.email} (${user.role})`);
    } else {
      // User in Clerk but not in DB - treat as free
      (req as any).userPlan = 'FREE';
      (req as any).isAnonymous = false;
    }

    next();
  } catch (error) {
    console.error('[UserPlan] Error checking user plan:', error);
    // On error, default to free tier
    (req as any).userPlan = 'FREE';
    (req as any).isAnonymous = true;
    next();
  }
}

/**
 * Convenience wrapper for common features
 */
export const requirePremiumFeature = requireFeatureAccess(Feature.ADVANCED_MATCHING);
export const requireAnalyticsAccess = requireFeatureAccess(Feature.ADVANCED_ANALYTICS);
export const requireBulkExport = requireFeatureAccess(Feature.BULK_EXPORT);
