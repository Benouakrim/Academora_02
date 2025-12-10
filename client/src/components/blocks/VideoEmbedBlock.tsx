// client/src/components/blocks/VideoEmbedBlock.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VideoEmbedBlock as VideoEmbedBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: VideoEmbedBlockType;
  isPreview?: boolean;
}

function getEmbedUrl(url: string, provider: string, videoId?: string): string {
  if (provider === 'youtube' && videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (provider === 'vimeo' && videoId) {
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
}

export default function VideoEmbedBlock({ block }: Props) {
  const { data } = block;
  const embedUrl = getEmbedUrl(data.videoUrl, data.provider, data.videoId);

  return (
    <Card>
      {block.title && (
        <CardHeader>
          <CardTitle>{block.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={block.title ? undefined : 'pt-6'}>
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
          {data.provider === 'internal' && data.videoUrl ? (
            <video
              src={data.videoUrl}
              controls
              autoPlay={data.autoplay}
              className="w-full h-full"
            />
          ) : (
            <iframe
              src={embedUrl}
              title={block.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        {data.caption && (
          <p className="text-sm text-gray-600 mt-3 text-center">{data.caption}</p>
        )}
      </CardContent>
    </Card>
  );
}
