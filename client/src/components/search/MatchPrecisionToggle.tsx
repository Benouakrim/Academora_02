import { Target, TrendingUp } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSearchStore } from '@/store/useSearchStore';
import { Badge } from '@/components/ui/badge';

/**
 * MatchPrecisionToggle Component
 * Simplifies "Strict Filtering" and "Include Reach Schools" into a single toggle
 * High Precision = strict filtering, exclude reach schools
 * Broad Match = generous filtering, include reach schools
 */
export default function MatchPrecisionToggle() {
  const { criteria, setCriteria } = useSearchStore();

  // High precision = strictFiltering=true AND includeReachSchools=false
  const isHighPrecision = criteria.strictFiltering === true && criteria.includeReachSchools === false;

  const handleToggle = (checked: boolean) => {
    if (checked) {
      // High Precision mode
      setCriteria({
        strictFiltering: true,
        includeReachSchools: false,
      });
    } else {
      // Broad Match mode (default)
      setCriteria({
        strictFiltering: false,
        includeReachSchools: true,
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border rounded-lg">
      <div className="flex items-center gap-3">
        {isHighPrecision ? (
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        )}
        
        <div>
          <div className="flex items-center gap-2">
            <Label htmlFor="precision-mode" className="text-sm font-semibold cursor-pointer">
              Match Score Precision
            </Label>
            <Badge variant={isHighPrecision ? 'default' : 'secondary'} className="text-xs">
              {isHighPrecision ? 'High' : 'Broad'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isHighPrecision 
              ? 'Strict filtering, excludes reach schools for higher accuracy'
              : 'Broader matching, includes reach schools for more options'}
          </p>
        </div>
      </div>

      <Switch
        id="precision-mode"
        checked={isHighPrecision}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}
