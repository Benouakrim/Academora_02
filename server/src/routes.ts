import { Router, Request, Response } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Future route placeholders
import universityRoutes from './routes/universities';
import matchingRoutes from './routes/matching';
import financialAidRoutes from './routes/financialAid';
import userRoutes from './routes/user';
import webhookRoutes from './routes/webhooks';
import adminRoutes from './routes/admin';
import articleRoutes from './routes/articles';
import uploadRoutes from './routes/upload';
import commentsRoutes from './routes/comments';
router.use('/universities', universityRoutes);
router.use('/match', matchingRoutes);
router.use('/aid', financialAidRoutes);
router.use('/user', userRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/admin', adminRoutes);
router.use('/articles', articleRoutes);
router.use('/upload', uploadRoutes);
router.use('/comments', commentsRoutes);
// router.use('/users', userRoutes);
// router.use('/saved', savedUniversityRoutes);
// router.use('/comparisons', comparisonRoutes);

export default router;
