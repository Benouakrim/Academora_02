import { Router } from 'express';
import * as controller from '../controllers/engagementController';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { toggleReviewHelpfulSchema } from '../validation/engagementSchemas';

const router = Router();

// POST /api/engagement/reviews/:id/helpful
router.post('/reviews/:id/helpful', requireAuth, validate(toggleReviewHelpfulSchema), controller.toggleReviewHelpful);

export default router;
