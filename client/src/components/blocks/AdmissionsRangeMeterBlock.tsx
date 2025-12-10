// client/src/components/blocks/AdmissionsRangeMeterBlock.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdmissionsRangeMeterBlock as AdmissionsRangeMeterBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: AdmissionsRangeMeterBlockType;
  isPreview?: boolean;
}

const metricLabels = {
  gpa: 'GPA',
  sat: 'SAT',
  act: 'ACT',
};

export default function AdmissionsRangeMeterBlock({ block }: Props) {
  const { data } = block;
  const label = metricLabels[data.metric];
  const range = data.max - data.min;
  const percentile25Pos = ((data.percentile25 - data.min) / range) * 100;
  const percentile75Pos = ((data.percentile75 - data.min) / range) * 100;
  const userPos = data.userValue ? ((data.userValue - data.min) / range) * 100 : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{block.title || `${label} Range`}</CardTitle>
        {data.description && (
          <p className="text-sm text-gray-600 mt-2">{data.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Range Bar */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-900">{label} Percentile Range</span>
              <span className="text-xs text-gray-500">25th - 75th</span>
            </div>
            <div className="relative h-10 bg-gray-200 rounded-full overflow-hidden">
              {/* 25-75 percentile range */}
              <div
                className="absolute h-full bg-blue-500 transition-all"
                style={{
                  left: `${percentile25Pos}%`,
                  right: `${100 - percentile75Pos}%`,
                }}
              />
              {/* User value marker */}
              {userPos !== null ? (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg transition-all"
                  style={{ left: `calc(${userPos}% - 12px)` }}
                  title={`Your value: ${data.userValue}`}
                />
              ) : null}
            </div>
          </div>

          {/* Labels and Values */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600">Min</p>
              <p className="text-lg font-semibold text-gray-900">{data.min}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Middle 50%</p>
              <p className="text-lg font-semibold text-blue-600">
                {data.percentile25} - {data.percentile75}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Max</p>
              <p className="text-lg font-semibold text-gray-900">{data.max}</p>
            </div>
          </div>

          {/* User Value Display */}
          {data.userValue !== undefined ? (
            <div className="pt-4 border-t bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-1">Your {label}</p>
              <p className="text-2xl font-bold text-green-600">{data.userValue}</p>
              <p className="text-xs text-gray-600 mt-2">
                {data.userValue >= data.percentile25 && data.userValue <= data.percentile75
                  ? 'In the middle 50%'
                  : data.userValue < data.percentile25
                    ? 'Below the middle 50%'
                    : 'Above the middle 50%'}
              </p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
