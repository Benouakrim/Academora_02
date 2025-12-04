import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as controller from '../controllers/FinancialProfileController';

const router = Router();

// Protect all financial profile operations
router.use(requireAuth);

// GET /api/financial-profile - Fetch financial profile
router.get('/', controller.getFinancialProfile);

// POST /api/financial-profile - Create or update (upsert)
router.post('/', controller.upsertFinancialProfile);

// PUT /api/financial-profile - Update (alias for upsert)
router.put('/', controller.upsertFinancialProfile);

// POST /api/financial-profile/initialize - Initialize with defaults
router.post('/initialize', controller.initializeFinancialProfile);

// DELETE /api/financial-profile - Delete
router.delete('/', controller.deleteFinancialProfile);

export default router;
