// client/src/components/blocks/KeyStatCardBlock.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KeyStatCardBlock as KeyStatCardBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: KeyStatCardBlockType;
  isPreview?: boolean;
}

export default function KeyStatCardBlock({ block }: Props) {
  const { data } = block;

  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus;
  const trendColor = data.trend === 'up' ? 'text-green-600' : data.trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold text-gray-900">
                {data.value}
              </span>
              {data.unit && (
                <span className="text-2xl font-semibold text-gray-600">
                  {data.unit}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              {data.label}
            </h3>
            {data.description && (
              <p className="text-sm text-gray-600">
                {data.description}
              </p>
            )}
            {data.trend && data.trendValue && (
              <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
                <TrendIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{data.trendValue}</span>
              </div>
            )}
          </div>
          {data.icon && (
            <div className="text-4xl opacity-20">
              {data.icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
