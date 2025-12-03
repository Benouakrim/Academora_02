// server/src/routes/microContent.ts
import { Router } from 'express';
import * as controller from '../controllers/microContentController';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// GET /api/micro-content/university/:universityId - Get all micro-content for a university
router.get('/university/:universityId', controller.getByUniversity);

// GET /api/micro-content/:id - Get specific micro-content by ID
router.get('/:id', controller.getOne);

// POST /api/micro-content - Create new micro-content (Admin only)
router.post('/', requireAdmin, controller.create);

// PUT /api/micro-content/:id - Update micro-content (Admin only)
router.put('/:id', requireAdmin, controller.update);

// PATCH /api/micro-content/reorder - Bulk update priorities (Admin only)
router.patch('/reorder', requireAdmin, controller.reorder);

// DELETE /api/micro-content/:id - Delete micro-content (Admin only)
router.delete('/:id', requireAdmin, controller.deleteMicroContent);

export default router;
