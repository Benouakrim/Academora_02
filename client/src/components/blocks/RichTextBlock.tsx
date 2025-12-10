// client/src/components/blocks/RichTextBlock.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { RichTextBlock as RichTextBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: RichTextBlockType;
  isPreview?: boolean;
}

export default function RichTextBlock({ block }: Props) {
  const { data } = block;

  return (
    <Card>
      <CardContent className="p-6 prose prose-sm max-w-none">
        {data.format === 'html' ? (
          <div dangerouslySetInnerHTML={{ __html: data.content }} />
        ) : (
          <div className="whitespace-pre-wrap">{data.content}</div>
        )}
      </CardContent>
    </Card>
  );
}
