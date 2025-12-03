import { Router } from 'express';
import * as controller from '../controllers/staticController';

const router = Router();

// GET /api/pages - List all published static pages
router.get('/', controller.getPages);

// GET /api/pages/:slug - Get specific static page by slug
router.get('/:slug', controller.getPage);

export default router;
