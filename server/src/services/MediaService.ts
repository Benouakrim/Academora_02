import prisma from '../lib/prisma';
import cloudinary from '../lib/cloudinary';
import { AppError } from '../utils/AppError';

interface CreateVideoData {
  title: string;
  description?: string;
  url: string;
  publicId?: string;
  type: 'UPLOAD' | 'EXTERNAL';
  thumbnailUrl?: string;
  position?: number;
}

interface UpdateVideoData {
  title?: string;
  description?: string;
  url?: string;
  thumbnailUrl?: string;
  position?: number;
  isActive?: boolean;
}

class MediaService {
  /**
   * Get all videos with optional filtering
   */
  async getAllVideos(activeOnly: boolean = false) {
    const where = activeOnly ? { isActive: true } : {};
    
    return await prisma.video.findMany({
      where,
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Get a single video by ID
   */
  async getVideoById(id: string) {
    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      throw new AppError(404, 'Video not found');
    }

    return video;
  }

  /**
   * Get the hero video (first active video)
   */
  async getHeroVideo() {
    return await prisma.video.findFirst({
      where: { isActive: true },
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Create a new video entry
   */
  async createVideo(data: CreateVideoData) {
    // Validate video type
    if (!['UPLOAD', 'EXTERNAL'].includes(data.type)) {
      throw new AppError(400, 'Invalid video type. Must be UPLOAD or EXTERNAL');
    }

    // For external videos, validate URL format
    if (data.type === 'EXTERNAL') {
      const isValidUrl = this.validateExternalVideoUrl(data.url);
      if (!isValidUrl) {
        throw new AppError(400, 'Invalid external video URL. Must be YouTube or Vimeo');
      }
    }

    return await prisma.video.create({
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        publicId: data.publicId,
        type: data.type,
        thumbnailUrl: data.thumbnailUrl,
        position: data.position ?? 0
      }
    });
  }

  /**
   * Update video metadata
   */
  async updateVideo(id: string, data: UpdateVideoData) {
    // Check if video exists
    await this.getVideoById(id);

    return await prisma.video.update({
      where: { id },
      data
    });
  }

  /**
   * Delete video and optionally remove from Cloudinary
   */
  async deleteVideo(id: string) {
    const video = await this.getVideoById(id);

    // If it's an uploaded video, delete from Cloudinary
    if (video.type === 'UPLOAD' && video.publicId) {
      try {
        await cloudinary.uploader.destroy(video.publicId, {
          resource_type: 'video'
        });
      } catch (error) {
        console.error('Failed to delete video from Cloudinary:', error);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    return await prisma.video.delete({
      where: { id }
    });
  }

  /**
   * Delete media asset from Cloudinary by publicId
   */
  async deleteMediaFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });

      if (result.result !== 'ok') {
        throw new AppError(404, 'Media not found or already deleted');
      }

      return result;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, `Failed to delete media: ${error.message}`);
    }
  }

  /**
   * Parse publicId from Cloudinary URL
   */
  parsePublicIdFromUrl(url: string): string {
    // Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
    const urlPattern = /\/upload\/(?:v\d+\/)?(.+?)\.\w+$/;
    const match = url.match(urlPattern);
    
    if (!match) {
      throw new AppError(400, 'Invalid Cloudinary URL format');
    }

    return match[1];
  }

  /**
   * Validate external video URL (YouTube/Vimeo)
   */
  private validateExternalVideoUrl(url: string): boolean {
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    const vimeoPattern = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+$/;
    
    return youtubePattern.test(url) || vimeoPattern.test(url);
  }

  /**
   * Bulk update video positions
   */
  async updateVideoPositions(updates: { id: string; position: number }[]) {
    const transactions = updates.map(({ id, position }) =>
      prisma.video.update({
        where: { id },
        data: { position }
      })
    );

    return await prisma.$transaction(transactions);
  }

  /**
   * Get optimized Cloudinary URL with transformations
   */
  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}): string {
    return cloudinary.url(publicId, {
      width: options.width,
      height: options.height,
      crop: options.crop || 'fill',
      quality: options.quality || 'auto',
      format: options.format || 'auto',
      fetch_format: 'auto'
    });
  }
}

export default new MediaService();
