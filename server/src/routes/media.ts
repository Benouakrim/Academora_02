import { Router } from 'express';
import {
  getAllVideos,
  getHeroVideo,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  updateVideoPositions
} from '../controllers/mediaController';
import { requireAuth, requireAdmin } from '../middleware/requireAuth';

const router = Router();

// Public routes (no auth required)
router.get('/videos/hero', getHeroVideo);
router.get('/videos', getAllVideos);
router.get('/videos/:id', getVideoById);

// Admin routes
router.post('/videos', requireAuth, requireAdmin, createVideo);
router.patch('/videos/:id', requireAuth, requireAdmin, updateVideo);
router.delete('/videos/:id', requireAuth, requireAdmin, deleteVideo);
router.post('/videos/positions', requireAuth, requireAdmin, updateVideoPositions);

export default router;
