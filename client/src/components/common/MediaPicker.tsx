// client/src/components/common/MediaPicker.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Video, X } from 'lucide-react';

interface MediaPickerProps {
  mediaId?: string;
  onMediaSelect: (id: string, url: string) => void;
  assetType: 'image' | 'video';
}

/**
 * MediaPicker Component
 * 
 * Provides a UI for selecting media assets from the Media Library.
 * Replaces direct URL input with Media ID selection for:
 * - Decoupling content from asset storage
 * - Easy asset replacement
 * - Centralized asset management
 * 
 * NEW (Prompt 12): Unified media selection across all blocks.
 */
export default function MediaPicker({
  mediaId,
  onMediaSelect,
  assetType,
}: MediaPickerProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Derive preview URL from mediaId (no effect needed for simple derivation)
  const previewUrl = mediaId ? `/api/media/preview/${mediaId}` : null;

  const handleClear = () => {
    onMediaSelect('', '');
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
          {/* Preview Display */}
          <div className="h-48 flex items-center justify-center bg-gray-100">
            {assetType === 'image' ? (
              <img
                src={previewUrl}
                alt="Media preview"
                className="object-cover w-full h-full"
                onError={(e) => {
                  // Hide broken image placeholder
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Video className="h-8 w-8 text-blue-500" />
                <span className="text-sm text-gray-600">Video</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-2 bg-white border-t border-gray-200 flex gap-2 justify-end">
            <Button
              onClick={() => setIsGalleryOpen(true)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Image className="h-4 w-4" />
              Change
            </Button>
            <Button
              onClick={handleClear}
              size="sm"
              variant="outline"
              className="text-red-600 hover:bg-red-50 gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>

          {/* Media ID Display */}
          <div className="p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 font-mono">
            ID: {mediaId}
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsGalleryOpen(true)}
          variant="outline"
          className="w-full h-48 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
        >
          {assetType === 'image' ? (
            <>
              <Image className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600">Select Image</span>
            </>
          ) : (
            <>
              <Video className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600">Select Video</span>
            </>
          )}
        </Button>
      )}

      {/* Gallery Modal (Placeholder) */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 flex flex-col gap-4">
            {/* Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Select {assetType === 'image' ? 'Image' : 'Video'}
              </h2>
              <Button
                onClick={() => setIsGalleryOpen(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Gallery Content (Placeholder) */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="text-center text-gray-500 py-8">
                <p className="mb-4 text-sm">
                  Media Gallery Component
                  {/* NOTE: This would be replaced with actual MediaGallery component 
                      that shows available assets, search, and filtering */}
                </p>
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded p-8">
                  <p className="text-xs text-gray-400">
                    Gallery placeholder - implement MediaGalleryModal with actual assets
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex gap-2 justify-end">
              <Button
                onClick={() => setIsGalleryOpen(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
