// client/src/components/blocks/CampusMapPOIBlock.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import type { CampusMapPOIBlock as CampusMapPOIBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: CampusMapPOIBlockType;
  isPreview?: boolean;
}

export default function CampusMapPOIBlock({ block }: Props) {
  const { data } = block;
  const zoom = data.zoom || 16;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {data.name}
        </CardTitle>
        {data.description ? (
          <p className="text-sm text-gray-600 mt-2">{data.description}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        {/* Map Placeholder */}
        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center mb-4">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {data.latitude}, {data.longitude}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.name} · Zoom Level {zoom}
            </p>
          </div>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Latitude</p>
            <p className="font-mono text-gray-900">{data.latitude}</p>
          </div>
          <div>
            <p className="text-gray-600">Longitude</p>
            <p className="font-mono text-gray-900">{data.longitude}</p>
          </div>
        </div>

        {/* Note about Google Maps */}
        <p className="text-xs text-gray-500 mt-4 p-2 bg-blue-50 rounded border border-blue-100">
          💡 To embed a live map, add your Google Maps API key to the environment configuration.
        </p>
      </CardContent>
    </Card>
  );
}
