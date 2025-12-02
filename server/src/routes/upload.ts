import { Router } from 'express';
import { uploadMiddleware, uploadImage } from '../controllers/uploadController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.post('/', requireAuth, uploadMiddleware, uploadImage);

export default router;
