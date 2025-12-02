import { Router } from 'express';
import * as controller from '../controllers/articleController';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { createArticleSchema, updateArticleSchema } from '../validation/cmsSchemas';

const router = Router();

// Public Routes
router.get('/', controller.getArticles);
router.get('/taxonomies', controller.getTaxonomies); // Combined categories/tags
router.get('/:slug', controller.getArticleBySlug);

// Protected Routes
router.post('/', requireAuth, validate(createArticleSchema), controller.createArticle);
router.put('/:id', requireAuth, validate(updateArticleSchema), controller.updateArticle);
router.delete('/:id', requireAuth, controller.deleteArticle);

export default router;