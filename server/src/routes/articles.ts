import { Router } from 'express';
import * as controller from '../controllers/articleController';

const router = Router();

router.get('/', controller.getArticles);
router.get('/categories', controller.getCategories);
router.get('/:slug', controller.getArticleBySlug);

export default router;