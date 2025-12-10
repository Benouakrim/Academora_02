import { Router } from 'express';
import * as controller from '../controllers/articleController';
import { requireAuth } from '../middleware/requireAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import { validate } from '../middleware/validate';
import { createArticleSchema, updateArticleSchema } from '../validation/cmsSchemas';

const router = Router();

// Public Routes
router.get('/', controller.getArticles);
router.get('/taxonomies', controller.getTaxonomies); // Combined categories/tags

// Admin review workflow (MUST come before /:id routes to not be caught by param matching)
router.get('/pending/list', requireAdmin, controller.getPendingArticles);

// Protected Routes
router.get('/mine/list', requireAuth, controller.getMyArticles);
router.post('/', requireAuth, validate(createArticleSchema), controller.createArticle);
router.put('/:id', requireAuth, validate(updateArticleSchema), controller.updateArticle);
router.delete('/:id', requireAuth, controller.deleteArticle);

// Like/Share Routes
router.post('/:id/like', requireAuth, controller.likeArticle);
router.delete('/:id/like', requireAuth, controller.unlikeArticle);
router.get('/:id/like/status', requireAuth, controller.getLikeStatus);
router.post('/:id/share', controller.shareArticle);

// Submission workflow
router.post('/:id/submit', requireAuth, controller.submitArticle);

// Admin review workflow - approve/reject
router.post('/:id/approve', requireAdmin, controller.approveArticle);
router.post('/:id/reject', requireAdmin, controller.rejectArticle);

// Slug-based routes (kept last to avoid shadowing specific paths)
router.get('/:slug', controller.getArticleBySlug);
router.post('/:slug/view', controller.recordView);

export default router;