import { Router, Request, Response } from 'express';
import { clerkAuth } from './middleware/requireAuth';

const router = Router();

// Health check endpoint (no auth required)
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Import routes
import universityRoutes from './routes/universities';
import matchingRoutes from './routes/matching';
import financialAidRoutes from './routes/financialAid';
import userRoutes from './routes/user';
import webhookRoutes from './routes/webhooks';
import adminRoutes from './routes/admin';
import articleRoutes from './routes/articles';
import uploadRoutes from './routes/upload';
import commentsRoutes from './routes/comments';
import reviewRoutes from './routes/reviews';
import engagementRoutes from './routes/engagement';
import groupRoutes from './routes/groups';
import staticRoutes from './routes/static';
import notificationRoutes from './routes/notifications';
import microContentRoutes from './routes/microContent';
import compareRoutes from './routes/compare';
import claimsRoutes from './routes/claims';
import referralsRoutes from './routes/referrals';
import billingRoutes from './routes/billing';
import onboardingRoutes from './routes/onboarding';
import academicProfileRoutes from './routes/academicProfile';
import financialProfileRoutes from './routes/financialProfile';

// Webhooks - NO AUTH (uses signature verification)
router.use('/webhooks', webhookRoutes);

// Apply Clerk auth to all other routes
router.use(clerkAuth);

// Protected routes (require authentication)
router.use('/universities', universityRoutes);
router.use('/match', matchingRoutes);
router.use('/aid', financialAidRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/articles', articleRoutes);
router.use('/upload', uploadRoutes);
router.use('/comments', commentsRoutes);
router.use('/reviews', reviewRoutes);
router.use('/engagement', engagementRoutes);
router.use('/groups', groupRoutes);
router.use('/pages', staticRoutes);
router.use('/notifications', notificationRoutes);
router.use('/micro-content', microContentRoutes);
router.use('/compare', compareRoutes);
router.use('/claims', claimsRoutes);
router.use('/referrals', referralsRoutes);
router.use('/billing', billingRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/academic-profile', academicProfileRoutes);
router.use('/financial-profile', financialProfileRoutes);
// router.use('/users', userRoutes);
// router.use('/saved', savedUniversityRoutes);
// router.use('/comparisons', comparisonRoutes);

export default router;
