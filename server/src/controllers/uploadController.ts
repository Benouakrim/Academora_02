import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import cloudinary from '../lib/cloudinary';
import { AppError } from '../utils/AppError';
import { Readable } from 'stream';
import MediaService from '../services/MediaService';
import axios from 'axios';

// Storage configuration
const storage = multer.memoryStorage();

// Image upload middleware (10MB limit)
export const uploadImageMiddleware = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new AppError(400, 'Only image files are allowed') as any);
    }
    cb(null, true);
  }
}).single('file');

// Video upload middleware (200MB limit)
export const uploadVideoMiddleware = multer({ 
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new AppError(400, 'Only video files are allowed') as any);
    }
    cb(null, true);
  }
}).single('file');

// Legacy middleware for backward compatibility (accepts 'image' field)
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new AppError(400, 'Only image files are allowed') as any);
    }
    cb(null, true);
  }
}).single('image');

/**
 * Helper function to stream buffer to Cloudinary
 */
const streamUpload = (
  buffer: Buffer, 
  folder: string, 
  resourceType: 'image' | 'video' = 'image',
  transformations?: any
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: resourceType,
    };

    // Add transformations if provided
    if (transformations) {
      uploadOptions.eager = transformations;
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: Error | undefined, result: any) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

/**
 * Upload image to Cloudinary or handle external URL
 * Accepts: multipart/form-data with 'file' field OR JSON with 'url' field
 */
export const uploadImage = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('[uploadImage] Starting:', {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      bodyUrl: req.body?.url,
    });

    let imageUrl: string;
    let publicId: string | undefined;
    let width: number | undefined;
    let height: number | undefined;
    let format: string | undefined;
    let bytes: number | undefined;

    // Check if it's a file upload or URL input
    if (req.file) {
      // Handle file upload
      const cloudinaryConfig = cloudinary.config();
      const hasCloudinaryCreds = cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret;

      if (!hasCloudinaryCreds) {
        // If Cloudinary is not configured, return a dev/test URL
        console.warn('[uploadImage] Cloudinary not configured, using test URL');
        imageUrl = `data:${req.file.mimetype};base64,${Buffer.from(req.file.buffer).toString('base64').substring(0, 100)}...`;
        throw new AppError(503, 'Cloudinary is not configured. Please set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET environment variables.');
      }

      try {
        console.log('[uploadImage] Uploading file to Cloudinary:', {
          size: req.file.size,
          mimetype: req.file.mimetype
        });

        const result: any = await streamUpload(
          req.file.buffer, 
          'academora/images',
          'image'
        );

        console.log('[uploadImage] Cloudinary upload success:', {
          publicId: result.public_id,
          url: result.secure_url
        });

        imageUrl = result.secure_url;
        publicId = result.public_id;
        width = result.width;
        height = result.height;
        format = result.format;
        bytes = result.bytes;
      } catch (uploadError: any) {
        console.error('[uploadImage] Cloudinary upload failed:', {
          message: uploadError.message,
          error: uploadError
        });
        throw new AppError(500, `Upload failed: ${uploadError.message || 'Unknown error'}`);
      }
    } else if (req.body.url) {
      // Handle external URL
      const url = req.body.url as string;
      
      console.log('[uploadImage] Using external URL:', { url });
      
      // Validate URL
      try {
        new URL(url);
      } catch {
        throw new AppError(400, 'Invalid URL format');
      }

      imageUrl = url;
      // No publicId for external URLs
    } else {
      throw new AppError(400, 'No image file or URL provided');
    }

    console.log('[uploadImage] Sending response:', { imageUrl, publicId });

    res.status(200).json({ 
      success: true,
      imageUrl,
      url: imageUrl, // Backward compatibility
      publicId,
      width,
      height,
      format,
      bytes,
      isExternal: !req.file // Flag to indicate if URL was external
    });
  } catch (err) {
    console.error('[uploadImage] Error:', err);
    next(err);
  }
};

/**
 * Upload video to Cloudinary or handle external URL
 * Accepts: multipart/form-data with 'file' field OR JSON with 'url' field
 */
export const uploadVideo = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
  next: NextFunction
) => {
  try {
    let videoUrl: string;
    let publicId: string | undefined;
    let duration: number | undefined;
    let width: number | undefined;
    let height: number | undefined;
    let format: string | undefined;
    let bytes: number | undefined;
    let thumbnailUrl: string | undefined;

    // Check if it's a file upload or URL input
    if (req.file) {
      // Handle file upload with optimization
      const result: any = await streamUpload(
        req.file.buffer,
        'academora/videos',
        'video',
        [
          { 
            width: 1280, 
            height: 720, 
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto'
          }
        ]
      );

      videoUrl = result.secure_url;
      publicId = result.public_id;
      duration = result.duration;
      width = result.width;
      height = result.height;
      format = result.format;
      bytes = result.bytes;
      thumbnailUrl = result.secure_url.replace(/\.(mp4|mov|avi|webm)$/, '.jpg');
    } else if (req.body.url) {
      // Handle external URL (YouTube, Vimeo, etc.)
      const url = req.body.url as string;
      
      // Validate URL
      try {
        new URL(url);
      } catch {
        throw new AppError(400, 'Invalid URL format');
      }

      // Validate it's a video URL (YouTube, Vimeo, etc.)
      const isValidVideoUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(url);
      if (!isValidVideoUrl) {
        throw new AppError(400, 'URL must be a valid video link (YouTube, Vimeo, etc.)');
      }

      videoUrl = url;
      // No publicId for external URLs
    } else {
      throw new AppError(400, 'No video file or URL provided');
    }

    res.status(200).json({
      success: true,
      videoUrl,
      publicId,
      duration,
      width,
      height,
      format,
      bytes,
      thumbnailUrl,
      isExternal: !req.file // Flag to indicate if URL was external
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete media from Cloudinary
 */
export const deleteMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    if (!publicId) {
      throw new AppError(400, 'Public ID is required');
    }

    // Decode the publicId (it might be URL encoded)
    let decodedPublicId = decodeURIComponent(publicId);

    // If it's a full URL, extract the public_id
    if (decodedPublicId.includes('cloudinary.com')) {
      decodedPublicId = MediaService.parsePublicIdFromUrl(decodedPublicId);
    }

    // Delete from Cloudinary
    const result = await MediaService.deleteMediaFromCloudinary(
      decodedPublicId,
      resourceType as 'image' | 'video'
    );

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully',
      result
    });
  } catch (err) {
    next(err);
  }
};

