// client/src/components/blocks/ComparisonMetricBlock.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ComparisonMetricBlock as ComparisonMetricBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: ComparisonMetricBlockType;
  isPreview?: boolean;
}

export default function ComparisonMetricBlock({ block }: Props) {
  const { data } = block;

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50">
      <CardHeader>
        <CardTitle>{block.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Our Value */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Our Value</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">
                {data.ourValue}
              </span>
              {data.unit && <span className="text-lg text-gray-600">{data.unit}</span>}
            </div>
          </div>

          {/* Comparison Value */}
          <div>
            <p className="text-sm text-gray-600 mb-2">{data.comparisonLabel}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-400">
                {data.comparisonValue}
              </span>
              {data.unit ? (
                <span className="text-lg text-gray-600">{data.unit}</span>
              ) : null}
            </div>
          </div>

          {/* Indicator */}
          <div className="flex items-center gap-2 pt-4 border-t">
            {data.isBetter ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <p className={`font-semibold ${data.isBetter ? 'text-green-600' : 'text-red-600'}`}>
              {data.isBetter ? 'Better than average' : 'Below average'}
            </p>
          </div>

          {data.description && (
            <p className="text-sm text-gray-700">{data.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
