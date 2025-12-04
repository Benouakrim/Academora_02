import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import * as controller from '../controllers/userController';
import { updateProfileSchema, toggleSavedSchema } from '../validation/userSchemas';
import { BadgeService } from '../services/BadgeService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Protect all user operations
router.use(requireAuth);

router.get('/profile', controller.getProfile);
router.patch('/profile', validate(updateProfileSchema), controller.updateProfile);
router.post('/saved/:id', validate(toggleSavedSchema), controller.toggleSaved);
router.get('/dashboard', controller.getUserDashboard);

// Get user badges
router.get('/badges', async (req, res, next) => {
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

export default router;
