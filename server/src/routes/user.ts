import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import * as controller from '../controllers/userController';
import { updateProfileSchema, toggleSavedSchema } from '../validation/userSchemas';
import { BadgeService } from '../services/BadgeService';
import { PublicProfileService } from '../services/PublicProfileService';
import prisma from '../lib/prisma';
const router = Router();

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
