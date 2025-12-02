import { Router } from 'express';
import * as controller from '../controllers/commentController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// GET /api/comments/:articleId
router.get('/:articleId', controller.getComments);

// POST /api/comments
// Body: { articleId, content, parentId? }
router.post('/', requireAuth, controller.createComment);

export default router;
