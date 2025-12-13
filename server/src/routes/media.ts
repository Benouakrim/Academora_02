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
import MediaService from '../services/MediaService';

const router = Router();

// Public routes (no auth required)
router.get('/videos/hero', getHeroVideo);
router.get('/videos', getAllVideos);
router.get('/videos/:id', getVideoById);

// NEW (Prompt 12): Media preview endpoint for resolving mediaId to URL
// Used by MediaPicker and block renderers to get actual asset URLs
router.get('/preview/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const mediaUrl = await MediaService.getMediaUrlById(mediaId);
    
    if (!mediaUrl) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    // Return redirect to actual media URL
    // Client can use this directly or fetch content via CORS
    return res.redirect(mediaUrl);
  } catch (error) {
    console.error('Error resolving media preview:', error);
    return res.status(500).json({ error: 'Failed to resolve media' });
  }
});

// Admin routes
router.post('/videos', requireAuth, requireAdmin, createVideo);
router.patch('/videos/:id', requireAuth, requireAdmin, updateVideo);
router.delete('/videos/:id', requireAuth, requireAdmin, deleteVideo);
router.post('/videos/positions', requireAuth, requireAdmin, updateVideoPositions);

export default router;
