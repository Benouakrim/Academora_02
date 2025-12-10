// client/src/components/blocks/ImageShowcaseBlock.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon } from 'lucide-react';
import type { ImageShowcaseBlock as ImageShowcaseBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: ImageShowcaseBlockType;
  isPreview?: boolean;
}

export default function ImageShowcaseBlock({ block }: Props) {
  const { data } = block;

  const aspectRatioClasses: Record<string, string> = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    'auto': 'auto',
  };

  const containerClass = aspectRatioClasses[data.aspectRatio || 'auto'] || 'auto';

  return (
    <Card>
      {block.title && (
        <CardHeader>
          <CardTitle>{block.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={block.title ? undefined : 'pt-6'}>
        <div className={`overflow-hidden rounded-lg bg-gray-100 ${containerClass}`}>
          {data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt={data.altText}
              className="w-full h-full object-cover"
              onClick={() => {
                if (data.clickable && data.linkUrl) {
                  window.open(data.linkUrl, '_blank');
                }
              }}
              style={{ cursor: data.clickable ? 'pointer' : 'default' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        {data.caption ? (
          <p className="text-sm text-gray-600 mt-3 text-center">{data.caption}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
