// client/src/components/blocks/ContactBoxBlock.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import type { ContactBoxBlock as ContactBoxBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: ContactBoxBlockType;
  isPreview?: boolean;
}

export default function ContactBoxBlock({ block }: Props) {
  const { data } = block;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle>{data.department}</CardTitle>
        {block.title ? (
          <p className="text-sm text-gray-600 mt-2">{block.title}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.email ? (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <a
                  href={`mailto:${data.email}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {data.email}
                </a>
              </div>
            </div>
          ) : null}
          {data.phone ? (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone</p>
                <a href={`tel:${data.phone}`} className="text-blue-600 hover:underline text-sm">
                  {data.phone}
                </a>
              </div>
            </div>
          ) : null}
          {data.location ? (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-700">{data.location}</p>
              </div>
            </div>
          ) : null}
          {data.officeHours ? (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Office Hours</p>
                <p className="text-sm text-gray-700">{data.officeHours}</p>
              </div>
            </div>
          ) : null}
          {data.additionalInfo ? (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-700">{data.additionalInfo}</p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
