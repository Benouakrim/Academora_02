// client/src/components/blocks/VideoEmbedBlock.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video as VideoIcon } from 'lucide-react';
import type { VideoEmbedBlock as VideoEmbedBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: VideoEmbedBlockType;
  isPreview?: boolean;
}

export default function VideoEmbedBlock({ block }: Props) {
  const { data } = block;

  return (
    <Card>
      {block.title && (
        <CardHeader>
          <CardTitle>{block.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={block.title ? undefined : 'pt-6'}>
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
          {data.videoUrl ? (
            <video
              src={data.videoUrl}
              controls
              autoPlay={data.autoplay}
              className="w-full h-full"
              poster={data.thumbnail}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-800">
              <VideoIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        {data.caption && (
          <p className="text-sm text-gray-600 mt-3 text-center">{data.caption}</p>
        )}
      </CardContent>
    </Card>
  );
}
