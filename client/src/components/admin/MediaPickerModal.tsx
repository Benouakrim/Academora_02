// client/src/components/admin/MediaPickerModal.tsx
// Modal component for selecting media assets from the unified media library

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mediaApi, MediaAsset } from '@/api/mediaApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, Check, Loader } from 'lucide-react';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: { mediaId: string; url: string; altText: string }) => void;
  filterType?: 'image' | 'video';
}

/**
 * MediaPickerModal provides a unified interface for selecting media assets
 * from the server's media library. Supports filtering by type.
 * 
 * NEW (Prompt 22): Media Integration Finalized - Client component for media picker.
 */
export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  filterType = 'image' 
}) => {
  const { data: assets = [], isLoading, isError } = useQuery<MediaAsset[]>({
    queryKey: ['mediaAssets', filterType],
    queryFn: () => mediaApi.fetchMediaAssets(filterType),
    enabled: isOpen, // Only fetch when modal is open
  });

  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  const handleSelect = (asset: MediaAsset) => {
    setSelectedAsset(asset);
  };

  const handleConfirm = () => {
    if (selectedAsset) {
      onSelect({
        mediaId: selectedAsset.id,
        url: selectedAsset.url,
        altText: selectedAsset.altText,
      });
      setSelectedAsset(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedAsset(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl p-0 h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <DialogTitle>
            Select {filterType === 'image' ? 'Image' : 'Video'} Asset
          </DialogTitle>
        </DialogHeader>

        {/* Main content area with scrolling */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <p className="text-gray-600">Loading media library...</p>
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500">Failed to load media assets. Please try again.</p>
            </div>
          )}

          {!isLoading && assets.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                No {filterType === 'image' ? 'images' : 'videos'} available in the media library.
              </p>
            </div>
          )}

          {!isLoading && assets.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className={`relative border-4 rounded-lg cursor-pointer transition-all overflow-hidden ${
                    selectedAsset?.id === asset.id
                      ? 'border-blue-500 ring-2 ring-blue-500'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => handleSelect(asset)}
                >
                  {/* Media thumbnail */}
                  <div className="h-32 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {asset.type === 'image' ? (
                      <img
                        src={asset.url}
                        alt={asset.altText}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full bg-gray-200">
                        <Video className="w-8 h-8 text-gray-600 mb-1" />
                        <span className="text-xs text-gray-600">Video</span>
                      </div>
                    )}
                  </div>

                  {/* Selection indicator */}
                  {selectedAsset?.id === asset.id && (
                    <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1 shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Asset ID/Name */}
                  <div className="p-2 bg-white border-t">
                    <p className="text-xs text-gray-700 truncate" title={asset.altText}>
                      {asset.altText || asset.publicId}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      ID: {asset.id.substring(0, 8)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div className="p-4 border-t flex justify-end gap-2 flex-shrink-0 bg-gray-50">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedAsset}>
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPickerModal;
