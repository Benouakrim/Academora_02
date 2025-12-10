// client/src/components/blocks/TestimonialQuoteBlock.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote, Star } from 'lucide-react';
import type { TestimonialQuoteBlock as TestimonialQuoteBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: TestimonialQuoteBlockType;
  isPreview?: boolean;
}

export default function TestimonialQuoteBlock({ block }: Props) {
  const { data } = block;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-8">
        <Quote className="h-8 w-8 text-blue-600 mb-4 opacity-50" />
        <blockquote className="text-lg font-medium text-gray-900 mb-4">
          "{data.quote}"
        </blockquote>
        <div className="flex items-center gap-3">
          {data.avatarUrl && (
            <img
              src={data.avatarUrl}
              alt={data.author}
              className="h-12 w-12 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{data.author}</p>
            {data.authorTitle ? (
              <p className="text-sm text-gray-600">{data.authorTitle}</p>
            ) : null}
            {data.rating && (
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < data.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
