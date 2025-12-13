// client/src/components/smart-blocks/MapDisplay.tsx
// Reusable display component for CampusMapPOI blocks

import React from 'react';
import { MapPin, Building } from 'lucide-react';

interface MapDisplayProps {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  zoom?: number;
  isInteractive?: boolean;
}

/**
 * MapDisplay component for rendering campus location and POI information.
 * 
 * NEW (Prompt 23): System Block Standardization - Display component for campus maps.
 * NOTE: In a real application, this component would integrate a mapping library
 * (e.g., Leaflet, Google Maps, Mapbox) to render an actual interactive map.
 */
export default function MapDisplay({
  name,
  description,
  latitude,
  longitude,
  zoom = 15,
  isInteractive = false,
}: MapDisplayProps) {
  return (
    <div className="relative p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      {/* Header with location name */}
      <div className="flex items-center gap-2 mb-3">
        <Building className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      </div>

      {/* Description */}
      {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}

      {/* Map Area - Placeholder for actual map implementation */}
      <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-md flex items-center justify-center text-center text-gray-600 overflow-hidden relative border border-gray-200">
        {/* Map Pin Indicator */}
        <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="bg-red-500 text-white rounded-full p-2 shadow-lg mb-1 animate-bounce">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="text-xs bg-white px-2 py-1 rounded shadow-md text-gray-700">
            Campus Location
          </div>
        </div>

        {/* Map Info Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-md px-3 py-2 text-xs text-gray-700 border border-gray-200 shadow-sm">
          <p className="font-semibold mb-1">Coordinates</p>
          <p>Latitude: {latitude.toFixed(4)}°</p>
          <p>Longitude: {longitude.toFixed(4)}°</p>
        </div>

        {/* Zoom Level Display for Interactive Mode */}
        {isInteractive && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-md px-3 py-2 text-xs text-gray-700 border border-gray-200 shadow-sm">
            Zoom: {zoom}x
          </div>
        )}

        {/* Placeholder Text */}
        <div className="text-center px-4">
          <p className="text-sm font-medium mb-1">
            {isInteractive ? 'Interactive Map Editor View' : 'Campus Map Placeholder'}
          </p>
          <p className="text-xs text-gray-500">
            (Requires mapping library API key)
          </p>
        </div>
      </div>

      {/* Map Controls Info */}
      {isInteractive && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700">
          <p className="font-semibold">Editor Mode:</p>
          <p>Drag to pan • Scroll to zoom • Click to set location</p>
        </div>
      )}
    </div>
  );
}
