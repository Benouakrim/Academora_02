import { api } from '@/lib/api';

export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  publicId?: string;
  type: 'UPLOAD' | 'EXTERNAL';
  thumbnailUrl?: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadImageResponse {
  success: boolean;
  imageUrl: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadVideoResponse {
  success: boolean;
  videoUrl: string;
  publicId: string;
  duration: number;
  width: number;
  height: number;
  format: string;
  bytes: number;
  thumbnailUrl: string;
}

export interface CreateVideoData {
  title: string;
  description?: string;
  url: string;
  publicId?: string;
  type: 'UPLOAD' | 'EXTERNAL';
  thumbnailUrl?: string;
  position?: number;
}

export interface UpdateVideoData {
  title?: string;
  description?: string;
  url?: string;
  thumbnailUrl?: string;
  position?: number;
  isActive?: boolean;
}

class MediaAPI {
  // Upload image
  async uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post<UploadImageResponse>(
      '/upload/image',
      formData
    );

    return data;
  }

  // Upload video
  async uploadVideo(file: File): Promise<UploadVideoResponse> {
    const formData = new FormData();
    formData.append('video', file);

    const { data } = await api.post<UploadVideoResponse>(
      '/upload/video',
      formData
    );

    return data;
  }

  // Delete media from Cloudinary
  async deleteMedia(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
    await api.delete(`/upload/${encodeURIComponent(publicId)}`, {
      params: { resourceType }
    });
  }

  // Get all videos
  async getAllVideos(activeOnly: boolean = false): Promise<Video[]> {
    const { data } = await api.get<{ success: boolean; count: number; data: Video[] }>(
      '/media/videos',
      { params: { activeOnly } }
    );
    return data.data;
  }

  // Get hero video
  async getHeroVideo(): Promise<Video | null> {
    const { data } = await api.get<{ success: boolean; data: Video | null }>(
      '/media/videos/hero'
    );
    return data.data;
  }

  // Get video by ID
  async getVideoById(id: string): Promise<Video> {
    const { data } = await api.get<{ success: boolean; data: Video }>(
      `/media/videos/${id}`
    );
    return data.data;
  }

  // Create video
  async createVideo(videoData: CreateVideoData): Promise<Video> {
    const { data } = await api.post<{ success: boolean; message: string; data: Video }>(
      '/media/videos',
      videoData
    );
    return data.data;
  }

  // Update video
  async updateVideo(id: string, updates: UpdateVideoData): Promise<Video> {
    const { data } = await api.patch<{ success: boolean; message: string; data: Video }>(
      `/media/videos/${id}`,
      updates
    );
    return data.data;
  }

  // Delete video
  async deleteVideo(id: string): Promise<void> {
    await api.delete(`/media/videos/${id}`);
  }

  // Bulk update video positions
  async updateVideoPositions(updates: { id: string; position: number }[]): Promise<Video[]> {
    const { data } = await api.post<{ success: boolean; message: string; data: Video[] }>(
      '/media/videos/positions',
      { updates }
    );
    return data.data;
  }
}

export const mediaApi = new MediaAPI();
