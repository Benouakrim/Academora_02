// client/src/components/blocks/ChecklistBlock.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare } from 'lucide-react';
import type { ChecklistBlock as ChecklistBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: ChecklistBlockType;
  isPreview?: boolean;
}

export default function ChecklistBlock({ block, isPreview = false }: Props) {
  const { data } = block;
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleToggle = (itemId: string) => {
    if (!data.allowUserCompletion || isPreview) return;
    setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = data.items?.length ?? 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            {block.title}
          </CardTitle>
          {data.allowUserCompletion && (
            <span className="text-sm text-gray-500">
              {completedCount}/{totalCount} completed
            </span>
          )}
        </div>
        {data.description && (
          <p className="text-sm text-gray-600 mt-2">{data.description}</p>
        )}
      </CardHeader>
      <CardContent>
        {data.allowUserCompletion && (
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        <ul className="space-y-3">
          {(data.items ?? []).map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <Checkbox
                id={item.id}
                checked={checkedItems[item.id] || item.completed || false}
                onCheckedChange={() => handleToggle(item.id)}
                disabled={!data.allowUserCompletion || isPreview}
                className="mt-0.5"
              />
              <label
                htmlFor={item.id}
                className={`text-sm cursor-pointer ${
                  checkedItems[item.id] || item.completed
                    ? 'line-through text-gray-500'
                    : 'text-gray-900'
                }`}
              >
                {item.text}
              </label>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
