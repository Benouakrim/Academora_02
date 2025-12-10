// client/src/components/blocks/ScholarshipSpotlightBlock.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, CheckCircle2, ExternalLink } from 'lucide-react';
import type { ScholarshipSpotlightBlock as ScholarshipSpotlightBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: ScholarshipSpotlightBlockType;
  isPreview?: boolean;
}

export default function ScholarshipSpotlightBlock({ block }: Props) {
  const { data } = block;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{data.scholarshipName}</CardTitle>
          {data.isRenewable && (
            <Badge className="bg-green-600">Renewable</Badge>
          )}
        </div>
        {data.sponsored && (
          <Badge variant="secondary" className="mt-2 w-fit">
            Sponsored
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Amount */}
          <div className="flex items-center gap-3 bg-white rounded-lg p-4">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Award Amount</p>
              <p className="text-2xl font-bold text-blue-600">{data.amount}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="font-medium text-gray-900 mb-2">About This Scholarship</p>
            <p className="text-sm text-gray-700">{data.description}</p>
          </div>

          {/* Eligibility */}
          {data.eligibility && (
            <div>
              <p className="font-medium text-gray-900 mb-2">Eligibility</p>
              <p className="text-sm text-gray-700">{data.eligibility}</p>
            </div>
          )}

          {/* Deadline */}
          {data.deadline && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-gray-600">Application Deadline</p>
                <p className="font-semibold text-gray-900">
                  {new Date(data.deadline).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="bg-white rounded-lg p-4 space-y-2">
            <p className="font-medium text-gray-900 text-sm">Benefits</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Full award amount of {data.amount}
              </div>
              {data.isRenewable && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Renewable for multiple years
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          {data.applicationUrl && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => window.open(data.applicationUrl, '_blank')}
            >
              Apply Now
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
