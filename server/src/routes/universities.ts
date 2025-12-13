import { Router } from 'express';
import { getUniversities, getUniversityBySlug, createUniversity, updateUniversity, deleteUniversity, getFullProfile, getMetricHistory } from '../controllers/universityController';
import { validate } from '../middleware/validate';
import { searchUniversitiesSchema } from '../validation/universitySchemas';
import { requireAdmin } from '../middleware/requireAdmin';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// Public
router.get('/', validate(searchUniversitiesSchema), getUniversities);
router.get('/search', validate(searchUniversitiesSchema), getUniversities); // Add search alias
// NEW: Route for complete merged profile with caching (must come BEFORE :slug routes)
router.get('/:slug/profile/full', getFullProfile);
// NEW (P30): Route for historical metrics data
router.get('/:universityId/history', getMetricHistory);
router.get('/:slug', getUniversityBySlug);

// Admin Only
router.post('/', requireAuth, requireAdmin, createUniversity);
router.put('/:slug', requireAuth, requireAdmin, updateUniversity); // :slug here serves as ID for updates
router.delete('/:slug', requireAuth, requireAdmin, deleteUniversity);

export default router;

