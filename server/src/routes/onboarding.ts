import { Router } from 'express';
import { OnboardingController } from '../controllers/OnboardingController';
import { validate } from '../middleware/validate';
import { onboardingDataSchema } from '../validation/onboardingSchemas';

const router = Router();

/**
 * POST /api/onboarding
 * Complete the onboarding process
 */
router.post(
  '/',
  validate(onboardingDataSchema),
  OnboardingController.postOnboarding
);

/**
 * GET /api/onboarding/status
 * Get onboarding status for the current user
 */
router.get(
  '/status',
  OnboardingController.getOnboardingStatus
);

/**
 * PUT /api/onboarding
 * Update/redo onboarding
 */
router.put(
  '/',
  validate(onboardingDataSchema),
  OnboardingController.updateOnboarding
);

/**
 * POST /api/onboarding/skip
 * Skip onboarding for now
 */
router.post(
  '/skip',
  OnboardingController.skipOnboarding
);

export default router;
