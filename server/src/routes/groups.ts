import { Router } from 'express';
import * as controller from '../controllers/groupController';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// GET /api/groups - List all university groups
router.get('/', controller.getGroups);

// GET /api/groups/:id - Get specific group by ID with member universities
router.get('/:id', controller.getGroup);

// GET /api/groups/slug/:slug - Get specific group by slug with member universities
router.get('/slug/:slug', controller.getGroupBySlug);

// POST /api/groups - Create new group (Admin only)
router.post('/', requireAdmin, controller.createGroup);

// PUT /api/groups/:id - Update group (Admin only)
router.put('/:id', requireAdmin, controller.updateGroup);

// PUT /api/groups/:id/metric-modes - Update metric mode configuration (Admin only)
router.put('/:id/metric-modes', requireAdmin, controller.updateMetricModes);

// POST /api/groups/:id/recalculate - Force recalculate metrics (Admin only)
router.post('/:id/recalculate', requireAdmin, controller.recalculateMetrics);

// DELETE /api/groups/:id - Delete group (Admin only)
router.delete('/:id', requireAdmin, controller.deleteGroup);

export default router;
