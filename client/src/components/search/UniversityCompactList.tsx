import { MapPin, DollarSign, Trophy, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UniversityMatchResult } from '@/hooks/useUniversitySearch';

interface UniversityCompactListProps {
  results: UniversityMatchResult[];
}

/**
 * UniversityCompactList Component
 * Renders university results as a fast, table-like list view
 * Optimized for quick scanning and comparison
 */
export default function UniversityCompactList({ results }: UniversityCompactListProps) {
  return (
    <div className="space-y-2">
      {/* Header Row */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-xs font-semibold text-muted-foreground">
        <div className="col-span-4">University</div>
        <div className="col-span-2">Location</div>
        <div className="col-span-2 text-center">Ranking</div>
        <div className="col-span-2 text-center">Tuition</div>
        <div className="col-span-2 text-center">Acceptance</div>
      </div>

      {/* Result Rows */}
      {results.map((result) => {
        const university = result.university;
        const tuition = university.tuitionInternational || university.tuitionOutState;
        const formattedTuition = tuition ? `$${(tuition / 1000).toFixed(0)}k` : 'N/A';

        return (
          <Link
            key={university.id}
            to={`/university/${university.slug}`}
            className="block group"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-3 bg-white dark:bg-neutral-900 border border-border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all">
              {/* University Name & Logo */}
              <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                {university.logoUrl ? (
                  <img
                    src={university.logoUrl}
                    alt={`${university.name} logo`}
                    className="w-10 h-10 object-contain rounded flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                    {university.name}
                  </h3>
                </div>
              </div>

              {/* Location */}
              <div className="col-span-6 md:col-span-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">
                  {university.city}, {university.state || university.country}
                </span>
              </div>

              {/* Ranking */}
              <div className="col-span-6 md:col-span-2 flex items-center justify-start md:justify-center gap-1.5">
                {university.ranking ? (
                  <>
                    <Trophy className="h-3.5 w-3.5 text-yellow-600" />
                    <span className="text-sm font-semibold">#{university.ranking}</span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">Unranked</span>
                )}
              </div>

              {/* Tuition */}
              <div className="col-span-6 md:col-span-2 flex items-center justify-start md:justify-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-green-600" />
                <span className="text-sm font-semibold">{formattedTuition}</span>
              </div>

              {/* Acceptance Rate */}
              <div className="col-span-6 md:col-span-2 flex items-center justify-start md:justify-center gap-1.5">
                {university.acceptanceRate ? (
                  <>
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-sm font-semibold">
                      {(university.acceptanceRate * 100).toFixed(0)}%
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">N/A</span>
                )}
              </div>
            </div>
          </Link>
        );
      })}

      {results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No universities found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
