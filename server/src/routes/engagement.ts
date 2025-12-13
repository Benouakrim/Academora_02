import { Router, Request, Response, NextFunction } from 'express';
import * as controller from '../controllers/engagementController';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { toggleReviewHelpfulSchema } from '../validation/engagementSchemas';

const router = Router();

// Middleware to extract userId and sessionId from request
const extractSessionContext = (req: Request, res: Response, next: NextFunction) => {
  const { sessionId } = req.body;
  
  // Get userId from Clerk auth if available
  const authSource = (req as any).auth as any;
  const auth = typeof authSource === 'function' ? authSource() : authSource;
  const userId = auth?.userId;
  
  // Set on request object for controller
  (req as any).sessionId = sessionId;
  (req as any).userId = userId;
  
  next();
};

// POST /api/engagement/reviews/:id/helpful
router.post('/reviews/:id/helpful', requireAuth, validate(toggleReviewHelpfulSchema), controller.toggleReviewHelpful);

// NEW ROUTE: Block Interaction Tracking (optional auth to capture userId if available)
router.post('/block-track', extractSessionContext, controller.trackBlockInteraction);

export default router;
