// client/src/components/blocks/BadgeRequirementBlock.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Award, CheckCircle2 } from 'lucide-react';
import type { BadgeRequirementBlock as BadgeRequirementBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: BadgeRequirementBlockType;
  isPreview?: boolean;
}

export default function BadgeRequirementBlock({ block }: Props) {
  const { data } = block;

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-600" />
              {data.badgeName}
            </CardTitle>
            <BadgeUI variant="secondary" className="mt-2">
              {data.badgeSlug}
            </BadgeUI>
          </div>
          {data.earnedByCount !== undefined && (
            <div className="text-right">
              <p className="text-xs text-gray-600">Earned by</p>
              <p className="text-lg font-bold text-yellow-600">{data.earnedByCount}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-900 mb-2">Description</p>
            <p className="text-sm text-gray-700">{data.description}</p>
          </div>

          <div>
            <p className="font-medium text-gray-900 mb-2">Requirements</p>
            <div className="bg-white rounded-lg p-4 border border-yellow-100">
              <p className="text-sm text-gray-700">{data.requirements}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-yellow-200">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">How to Earn This Badge</p>
            </div>
            <ol className="mt-3 space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>Complete the listed requirements</li>
              <li>Your progress will be tracked automatically</li>
              <li>Earn the badge once all requirements are met</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
