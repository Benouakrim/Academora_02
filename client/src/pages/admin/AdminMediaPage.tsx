import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Video as VideoIcon, 
  Image as ImageIcon, 
  Plus, 
  Pencil, 
  Trash2, 
  Copy, 
  ExternalLink,
  Upload,
  Eye,
  EyeOff,
  GripVertical,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/common/ImageUpload';
import VideoPlayer from '@/components/common/VideoPlayer';
import MediaGallery from '@/components/admin/MediaGallery';
import { mediaApi, type Video } from '@/api/mediaApi';
import { toast } from 'sonner';

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  const [quickUploadUrl, setQuickUploadUrl] = useState('');
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  // Fetch videos
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['admin', 'videos'],
    queryFn: () => mediaApi.getAllVideos()
  });

  // Fetch hero video
  const { data: heroVideo } = useQuery({
    queryKey: ['hero', 'video'],
    queryFn: () => mediaApi.getHeroVideo()
  });

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: (id: string) => mediaApi.deleteVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['hero', 'video'] });
      toast.success('Video deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete video');
    }
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      mediaApi.updateVideo(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['hero', 'video'] });
      toast.success('Video visibility updated');
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const [activeTab, setActiveTab] = useState<'manage' | 'gallery'>('manage');

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Media Library</h1>
        <p className="text-muted-foreground">
          Manage hero videos, upload images, and organize media assets
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b">
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'manage'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Manage Media
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'gallery'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Gallery
        </button>
      </div>

      {/* Manage Tab */}
      {activeTab === 'manage' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hero Banner Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <VideoIcon className="h-5 w-5" />
                  Hero Banner
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  First active video appears on the landing page
                </p>
              </div>
            </div>

            {heroVideo ? (
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden border bg-black">
                  <VideoPlayer
                    url={heroVideo.url}
                    type={heroVideo.type}
                    thumbnailUrl={heroVideo.thumbnailUrl}
                    controls
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-medium">{heroVideo.title}</h3>
                    {heroVideo.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {heroVideo.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(heroVideo.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingVideo(heroVideo)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-lg border-2 border-dashed flex items-center justify-center">
                <div className="text-center">
                  <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hero video set. Add a video below.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Video Library */}
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <VideoIcon className="h-5 w-5" />
                Video Library
              </h2>
              <Button onClick={() => setShowVideoForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No videos yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-sm font-medium">
                      #{index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{video.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {video.type} • Position: {video.position}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            id: video.id,
                            isActive: !video.isActive
                          })
                        }
                      >
                        {video.isActive ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingVideo(video)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this video?')) {
                            deleteVideoMutation.mutate(video.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Image Upload */}
        <div className="space-y-6">
          <div className="border rounded-lg p-6 bg-card sticky top-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5" />
              Quick Image Upload
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload an image to get a hosted URL for use in articles
            </p>

            <ImageUpload
              value={quickUploadUrl}
              onChange={(url) => setQuickUploadUrl(url)}
              allowUrl
              maxSizeMB={10}
            />

            {quickUploadUrl && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium mb-2">Image URL:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickUploadUrl}
                    readOnly
                    className="flex-1 px-2 py-1 text-xs bg-background border rounded"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(quickUploadUrl)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <MediaGallery />
      )}

      {/* Video Form Modal - To be implemented */}
      {(showVideoForm || editingVideo) && (
        <VideoFormModal
          video={editingVideo}
          onClose={() => {
            setShowVideoForm(false);
            setEditingVideo(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'videos'] });
            queryClient.invalidateQueries({ queryKey: ['hero', 'video'] });
            setShowVideoForm(false);
            setEditingVideo(null);
          }}
        />
      )}
    </div>
  );
}

// Video Form Modal Component
interface VideoFormModalProps {
  video: Video | null;
  onClose: () => void;
  onSuccess: () => void;
}

function VideoFormModal({ video, onClose, onSuccess }: VideoFormModalProps) {
  const [formData, setFormData] = useState({
    title: video?.title || '',
    description: video?.description || '',
    url: video?.url || '',
    type: video?.type || 'EXTERNAL' as 'UPLOAD' | 'EXTERNAL',
    thumbnailUrl: video?.thumbnailUrl || '',
    position: video?.position || 0
  });
  const [isUploading, setIsUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (video) {
        return mediaApi.updateVideo(video.id, data);
      } else {
        return mediaApi.createVideo(data);
      }
    },
    onSuccess: () => {
      toast.success(video ? 'Video updated' : 'Video created');
      onSuccess();
    },
    onError: () => {
      toast.error(video ? 'Failed to update video' : 'Failed to create video');
    }
  });

  const handleVideoUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await mediaApi.uploadVideo(file);
      setFormData(prev => ({
        ...prev,
        url: result.videoUrl,
        type: 'UPLOAD',
        thumbnailUrl: result.thumbnailUrl
      }));
      toast.success('Video uploaded');
    } catch {
      toast.error('Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            {video ? 'Edit Video' : 'Add Video'}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="Enter video title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg bg-background min-h-[100px]"
              placeholder="Enter video description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Video Source</label>
            <div className="flex gap-2 mb-3">
              <Button
                size="sm"
                variant={formData.type === 'EXTERNAL' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, type: 'EXTERNAL' }))}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                External Link
              </Button>
              <Button
                size="sm"
                variant={formData.type === 'UPLOAD' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, type: 'UPLOAD' }))}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
            </div>

            {formData.type === 'EXTERNAL' ? (
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-background"
                placeholder="https://youtube.com/watch?v=..."
              />
            ) : (
              <div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(file);
                  }}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                  disabled={isUploading}
                />
                {isUploading && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading video...
                  </p>
                )}
                {formData.url && formData.type === 'UPLOAD' && (
                  <p className="text-sm text-green-600 mt-2">✓ Video uploaded</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Position</label>
            <input
              type="number"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              min="0"
            />
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate(formData)}
            disabled={!formData.title || !formData.url || mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              video ? 'Update Video' : 'Create Video'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
