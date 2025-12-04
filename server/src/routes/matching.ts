import { Router } from 'express';
import { calculateMatches, getRecommendations, discoverUniversities, getInitialCriteria } from '../controllers/matchingController';
import { requireAuth } from '../middleware/requireAuth';
import { requireFeatureAccess, Feature } from '../middleware/requireFeatureAccess';
import { validate } from '../middleware/validate';
import { matchRequestSchema, discoveryCriteriaSchema } from '../validation/matchingSchemas';

const router = Router();

// Get personalized recommendations based on user's onboarding profile
// This endpoint is available to all authenticated users
router.get(
  '/recommendations',
  requireAuth,
  getRecommendations
);

// Get initial search criteria based on user's profile data
// Returns pre-filled filters from user's academic, financial, and location preferences
router.get(
  '/initial-criteria',
  requireAuth,
  getInitialCriteria
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

// New high-performance discovery endpoint
// POST /api/matching/universities - Comprehensive search with filters, sorting, and pagination
// Uses optional authentication with tiered access (free users get top 3 results)
import { attachUserPlan } from '../middleware/requireFeatureAccess';

router.post(
  '/universities',
  attachUserPlan, // Optional auth - attaches user plan if authenticated
  validate(discoveryCriteriaSchema),
  discoverUniversities
);

export default router;
