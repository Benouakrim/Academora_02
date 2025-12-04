import { Router } from 'express';
import * as controller from '../controllers/compareController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// Public route for bulk university comparison
router.get('/', controller.getBulkDetailsBySlugs);

// Protected routes - require authentication
router.post('/with-predictions', requireAuth, controller.getWithPredictions);
router.post('/analyze', requireAuth, controller.analyzeComparison);

// Saved comparisons
router.get('/saved', requireAuth, controller.getSavedComparisons);
router.post('/saved', requireAuth, controller.saveComparison);
router.get('/saved/:id', requireAuth, controller.getSavedComparisonById);
router.delete('/saved/:id', requireAuth, controller.deleteSavedComparison);

export default router;
