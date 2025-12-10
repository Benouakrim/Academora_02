// client/src/components/blocks/TimelineRoadmapBlock.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import type { TimelineRoadmapBlock as TimelineRoadmapBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: TimelineRoadmapBlockType;
  isPreview?: boolean;
}

export default function TimelineRoadmapBlock({ block }: Props) {
  const { data } = block;

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
          {data.steps.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-2 ${
                  step.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                {index < data.steps.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-300 my-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <h4 className="font-semibold text-gray-900">{step.title}</h4>
                {step.date && (
                  <p className="text-sm text-gray-500">{new Date(step.date).toLocaleDateString()}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
