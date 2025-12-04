import { Router } from 'express';
import { AcademicProfileController } from '../controllers/AcademicProfileController';
import { validate } from '../middleware/validate';
import { updateAcademicProfileSchema } from '../validation/academicProfileSchemas';

const router = Router();

/**
 * GET /api/academic-profile
 * Get the current user's academic profile with completeness score
 */
router.get(
  '/',
  AcademicProfileController.getAcademicProfile
);

/**
 * POST /api/academic-profile
 * Create or update the current user's academic profile
 */
router.post(
  '/',
  validate(updateAcademicProfileSchema),
  AcademicProfileController.upsertAcademicProfile
);

/**
 * PUT /api/academic-profile
 * Update the current user's academic profile (same as POST)
 */
router.put(
  '/',
  validate(updateAcademicProfileSchema),
  AcademicProfileController.updateAcademicProfile
);

/**
 * DELETE /api/academic-profile
 * Delete the current user's academic profile
 */
router.delete(
  '/',
  AcademicProfileController.deleteAcademicProfile
);

/**
 * POST /api/academic-profile/initialize
 * Initialize an empty academic profile for the current user
 */
router.post(
  '/initialize',
  AcademicProfileController.initializeAcademicProfile
);

/**
 * GET /api/academic-profile/completeness
 * Get the profile completeness score
 */
router.get(
  '/completeness',
  AcademicProfileController.getCompleteness
);

export default router;
