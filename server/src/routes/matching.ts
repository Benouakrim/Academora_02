import { Router } from 'express';
import { calculateMatches, getRecommendations } from '../controllers/matchingController';
import { requireAuth } from '../middleware/requireAuth';
import { requireFeatureAccess, Feature } from '../middleware/requireFeatureAccess';
import { validate } from '../middleware/validate';
import { matchRequestSchema } from '../validation/matchingSchemas';

const router = Router();

// Get personalized recommendations based on user's onboarding profile
// This endpoint is available to all authenticated users
router.get(
  '/recommendations',
  requireAuth,
  getRecommendations
);

// Protected route: Requires authentication AND feature access
// This demonstrates the layered security approach for premium features
router.post(
  '/', 
  requireAuth, 
  requireFeatureAccess(Feature.ADVANCED_MATCHING), 
  validate(matchRequestSchema), 
  calculateMatches
);

export default router;
