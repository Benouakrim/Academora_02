import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import * as controller from '../controllers/userController';
import { updateProfileSchema, toggleSavedSchema } from '../validation/userSchemas';
import { BadgeService } from '../services/BadgeService';
import { PublicProfileService } from '../services/PublicProfileService';
import prisma from '../lib/prisma';
const router = Router();

// Diagnostic endpoint to check auth status (before requireAuth middleware)
router.get('/auth/status', async (req: Request, res: Response) => {
  try {
    const authSource = (req as any).auth as any;
    const auth = typeof authSource === 'function' ? authSource() : authSource;
    
    console.log('[Auth Status] Diagnostic check:', {
      hasAuthSource: !!authSource,
      authType: typeof authSource,
      hasAuth: !!auth,
      userId: auth?.userId,
      hasAuthHeader: !!req.headers.authorization,
      authHeaderStart: req.headers.authorization?.substring(0, 30)
    });
    
    return res.json({
      authenticated: !!(auth && auth.userId),
      userId: auth?.userId || null,
      hasAuthObject: !!auth,
      hasAuthHeader: !!req.headers.authorization,
      clerkConfigured: !!(process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Auth Status] Error:', error);
    return res.status(500).json({
      error: 'Failed to check auth status',
      message: error.message
    });
  }
});

// Protect all user operations
router.use(requireAuth);

router.get('/profile', controller.getProfile);
router.patch('/profile', validate(updateProfileSchema), controller.updateProfile);
router.post('/saved/:id', validate(toggleSavedSchema), controller.toggleSaved);
router.get('/dashboard', controller.getUserDashboard);

// Get user badges
router.get('/badges', async (req, res, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) return res.status(401).json({ error: 'unauthenticated' });
    
    // Get internal user ID from Clerk ID
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const [userBadges, allBadges] = await Promise.all([
      BadgeService.getUserBadges(user.id),
      BadgeService.getAllBadges(),
    ]);
    res.json({ userBadges, allBadges });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /user/profile/privacy
 * Get privacy settings for authenticated user
 */
router.get('/profile/privacy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) return res.status(401).json({ error: 'unauthenticated' });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const settings = await PublicProfileService.getPrivacySettings(user.id);

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /user/profile/privacy
 * Update privacy settings for authenticated user
 */
router.patch('/profile/privacy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) return res.status(401).json({ error: 'unauthenticated' });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { username, profileVisibility, profileSettings } = req.body;

    const updatedSettings = await PublicProfileService.updatePrivacySettings(user.id, {
      username,
      profileVisibility,
      profileSettings,
    });

    return res.status(200).json({
      success: true,
      data: updatedSettings,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
