// server/src/routes/microContent.ts
import { Router } from 'express';
import * as controller from '../controllers/microContentController';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// POST /api/micro-content - Create new micro-content (Admin only)
router.post('/', requireAdmin, controller.create);

// PATCH /api/micro-content/reorder - Bulk update priorities (Admin only)
// Must be before /:id to avoid being matched as :id = "reorder"
router.patch('/reorder', requireAdmin, controller.reorder);

// POST /api/micro-content/duplicate - Duplicate block to multiple universities (Admin only)
// PROMPT 20: Multi-Block Batch Management
// Must be before /:id to avoid being matched as :id = "duplicate"
router.post('/duplicate', requireAdmin, controller.duplicateMicroContent);

// DELETE /api/micro-content/bulk-delete - Bulk delete blocks (Admin only)
// PROMPT 20: Multi-Block Batch Management
// Must be before /:id to avoid being matched as :id = "bulk-delete"
router.delete('/bulk-delete', requireAdmin, controller.bulkDeleteMicroContent);

// GET /api/micro-content/university/:universityId - Get all micro-content for a university
// Must be before /:id to avoid being matched as :id = "university"
router.get('/university/:universityId', controller.getByUniversity);

// GET /api/micro-content/:id - Get specific micro-content by ID
router.get('/:id', controller.getOne);

// PUT /api/micro-content/:id - Update micro-content (Admin only)
router.put('/:id', requireAdmin, controller.update);

// DELETE /api/micro-content/:id - Delete micro-content (Admin only)
router.delete('/:id', requireAdmin, controller.deleteMicroContent);

export default router;
