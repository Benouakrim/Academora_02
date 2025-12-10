// client/src/components/blocks/CostBreakdownChartBlock.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CostBreakdownChartBlock as CostBreakdownChartBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: CostBreakdownChartBlockType;
  isPreview?: boolean;
}

export default function CostBreakdownChartBlock({ block }: Props) {
  const { data } = block;
  const total = data.total || data.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{block.title}</CardTitle>
        {data.description && (
          <p className="text-sm text-gray-600 mt-2">{data.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Bar Chart */}
          <div className="space-y-3">
            {data.items.map((item) => {
              const percentage = (item.amount / total) * 100;
              const color = item.color || '#3b82f6';

              return (
                <div key={item.id}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {data.currency}{item.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(percentage)}%</p>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-900">Total Cost</p>
              <p className="text-lg font-bold text-blue-600">
                {data.currency}{total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
