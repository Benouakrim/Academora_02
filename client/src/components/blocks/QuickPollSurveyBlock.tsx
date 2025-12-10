// client/src/components/blocks/QuickPollSurveyBlock.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { QuickPollSurveyBlock as QuickPollSurveyBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: QuickPollSurveyBlockType;
  isPreview?: boolean;
}

export default function QuickPollSurveyBlock({ block }: Props) {
  const { data } = block;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const handleToggle = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      if (!data.allowMultiple && newSet.size > 0) {
        newSet.clear();
      }
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const totalVotes = data.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{block.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium text-gray-900 mb-4">{data.question}</p>
        <div className="space-y-3">
          {data.options.map((option) => {
            const percentage = totalVotes > 0 ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0;
            const isSelected = selectedIds.has(option.id);

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center gap-3">
                  {data.allowMultiple ? (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(option.id)}
                      disabled={submitted}
                    />
                  ) : (
                    <input
                      type="radio"
                      name="poll-option"
                      id={option.id}
                      checked={isSelected}
                      onChange={() => handleToggle(option.id)}
                      disabled={submitted}
                    />
                  )}
                  <label htmlFor={option.id} className="flex-1 text-sm font-medium cursor-pointer">
                    {option.text}
                  </label>
                  {data.showResults && submitted ? (
                    <span className="text-sm text-gray-500">{percentage}%</span>
                  ) : null}
                </div>
                {data.showResults && submitted ? (
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden ml-7">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {!submitted ? (
          <Button
            className="mt-4 w-full"
            onClick={() => setSubmitted(true)}
            disabled={selectedIds.size === 0}
          >
            Submit
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
