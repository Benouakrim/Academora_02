import { Router, Request, Response, NextFunction } from 'express';
import { 
  uploadImageMiddleware, 
  uploadVideoMiddleware,
  uploadImage, 
  uploadVideo,
  deleteMedia,
  uploadMiddleware
} from '../controllers/uploadController';
import { requireAuth, requireAdmin } from '../middleware/requireAuth';
import { AppError } from '../utils/AppError';

const router = Router();

/**
 * Unified image upload/input endpoint
 * Supports:
 * - POST multipart/form-data with 'file' field for file uploads
 * - POST application/json with 'url' field for external URLs
 * - GET with 'url' query parameter for external URLs
 */
const handleImageRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log('[Upload Image] Request:', {
    method: req.method,
    contentType: req.get('content-type'),
    hasFile: !!(req as any).file,
    bodyUrl: req.body?.url,
    queryUrl: req.query?.url,
  });

  // Check if it's a URL input (GET or POST with URL in body/query)
  const urlInput = req.body?.url || req.query?.url;
  
  if (urlInput && typeof urlInput === 'string') {
    // Handle as URL input without multer
    return uploadImage(req as any, res, next);
  }
  
  // Otherwise, use multer middleware for file upload
  uploadImageMiddleware(req, res, (err) => {
    if (err) {
      console.error('[Upload Image] Multer error:', err);
      return next(err);
    }
    console.log('[Upload Image] After multer:', { hasFile: !!(req as any).file });
    uploadImage(req as any, res, next);
  });
};

/**
 * Unified video upload/input endpoint
 * Supports:
 * - POST multipart/form-data with 'file' field for file uploads
 * - POST application/json with 'url' field for external URLs
 * - GET with 'url' query parameter for external URLs
 */
const handleVideoRequest = (req: Request, res: Response, next: NextFunction) => {
  // Check if it's a URL input (GET or POST with URL in body/query)
  const urlInput = req.body?.url || req.query?.url;
  
  if (urlInput && typeof urlInput === 'string') {
    // Handle as URL input without multer
    return uploadVideo(req as any, res, next);
  }
  
  // Otherwise, use multer middleware for file upload
  uploadVideoMiddleware(req, res, (err) => {
    if (err) return next(err);
    uploadVideo(req as any, res, next);
  });
};

// Image upload endpoint - unified for both files and URLs
router.post('/image', requireAuth, handleImageRequest);
router.get('/image', requireAuth, handleImageRequest);

// Video upload endpoint - unified for both files and URLs
router.post('/video', requireAuth, handleVideoRequest);
router.get('/video', requireAuth, handleVideoRequest);

// Delete media endpoint (Admin only)
router.delete('/:publicId', requireAuth, requireAdmin, deleteMedia);

// Legacy endpoint for backward compatibility
router.post('/', requireAuth, uploadMiddleware, uploadImage);

export default router;

