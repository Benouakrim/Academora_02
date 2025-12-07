import { Request, Response, NextFunction } from 'express';
import MediaService from '../services/MediaService';
import { AppError } from '../utils/AppError';

/**
 * Get all videos
 */
export const getAllVideos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const videos = await MediaService.getAllVideos(activeOnly);

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (err) {
    // If database is unavailable, return empty array instead of error
    if ((err as any)?.code === 'P1000' || (err as any)?.code === 'P1001') {
      console.warn('[MediaService] Database connection error, returning empty videos');
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    next(err);
  }
};

/**
 * Get hero video (first active video)
 */
export const getHeroVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hero = await MediaService.getHeroVideo();

    res.status(200).json({
      success: true,
      data: hero
    });
  } catch (err) {
    // If database is unavailable, return null for hero video
    if ((err as any)?.code === 'P1000' || (err as any)?.code === 'P1001') {
      console.warn('[MediaService] Database connection error, returning null for hero video');
      return res.status(200).json({
        success: true,
        data: null
      });
    }
    next(err);
  }
};

/**
 * Get video by ID
 */
export const getVideoById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const video = await MediaService.getVideoById(id);

    res.status(200).json({
      success: true,
      data: video
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new video entry
 */
export const createVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, url, publicId, type, thumbnailUrl, position } = req.body;

    // Validation
    if (!title || !url || !type) {
      throw new AppError(400, 'Title, URL, and type are required');
    }

    const video = await MediaService.createVideo({
      title,
      description,
      url,
      publicId,
      type,
      thumbnailUrl,
      position
    });

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update video metadata
 */
export const updateVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title, description, url, thumbnailUrl, position, isActive } = req.body;

    const video = await MediaService.updateVideo(id, {
      title,
      description,
      url,
      thumbnailUrl,
      position,
      isActive
    });

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: video
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete video
 */
export const deleteVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await MediaService.deleteVideo(id);

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Bulk update video positions
 */
export const updateVideoPositions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      throw new AppError(400, 'Updates must be an array');
    }

    const videos = await MediaService.updateVideoPositions(updates);

    res.status(200).json({
      success: true,
      message: 'Video positions updated successfully',
      data: videos
    });
  } catch (err) {
    next(err);
  }
};
