import { MapPin, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import type { UniversityMatchResult } from '@/hooks/useUniversitySearch';

interface UniversityMapLayoutProps {
  results: UniversityMatchResult[];
}

/**
 * UniversityMapLayout Component
 * Layout for map-based visualization of university locations
 * 
 * NOTE: This is a placeholder implementation. To complete this view:
 * 1. Install a map library (e.g., react-leaflet, mapbox-gl, google-maps-react)
 * 2. Add latitude/longitude fields to University model in Prisma
 * 3. Implement interactive map with markers for each university
 * 4. Add clustering for dense areas
 * 5. Implement marker click to show university details in sidebar/popup
 */
export default function UniversityMapLayout({ results }: UniversityMapLayoutProps) {
  return (
    <div className="relative h-[calc(100vh-16rem)] bg-muted rounded-lg overflow-hidden">
      {/* Placeholder Map Area */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          
          <h3 className="text-xl font-semibold">Map View Coming Soon</h3>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Interactive map visualization will allow you to:
            </p>
            <ul className="text-left space-y-1 ml-8 list-disc">
              <li>See university locations on an interactive map</li>
              <li>Cluster markers for better visualization</li>
              <li>Click markers to view university details</li>
              <li>Filter by geographic regions</li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-2 pt-4">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-muted-foreground">
              Found {results.length} universities
            </span>
          </div>
        </div>
      </div>

      {/* Side Panel with Results List (Temporary UI) */}
      <div className="absolute top-0 right-0 w-80 h-full bg-white dark:bg-neutral-900 border-l border-border shadow-lg overflow-y-auto">
        <div className="p-4 border-b border-border sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h3 className="font-semibold">Universities ({results.length})</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Switch to Card or List view for full details
          </p>
        </div>

        <div className="p-3 space-y-2">
          {results.map((result) => {
            const university = result.university;
            const tuition = university.tuitionInternational || university.tuitionOutState;

            return (
              <Link
                key={university.id}
                to={`/university/${university.slug}`}
                className="block"
              >
                <div className="p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors space-y-2">
                  <div className="flex items-start gap-2">
                    {university.logoUrl && (
                      <img
                        src={university.logoUrl}
                        alt={university.name}
                        className="w-8 h-8 object-contain rounded flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm truncate">
                        {university.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">
                          {university.city}, {university.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  {tuition && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Tuition</span>
                      <span className="font-semibold">
                        ${(tuition / 1000).toFixed(0)}k
                      </span>
                    </div>
                  )}

                  {university.ranking && (
                    <Badge variant="secondary" className="text-xs">
                      Rank #{university.ranking}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
