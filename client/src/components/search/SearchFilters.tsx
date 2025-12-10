import { 
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import { useSearchStore } from '@/store/useSearchStore';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QuickFilters from './QuickFilters';
import AdvancedFiltersModal from './AdvancedFiltersModal';
import MatchPrecisionToggle from './MatchPrecisionToggle';

export default function SearchFilters() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showWeights, setShowWeights] = useState(false);
  
  const {
    criteria,
    setWeights,
    resetFilters,
  } = useSearchStore();

  const weights = criteria.weights || {
    academic: 40,
    financial: 30,
    location: 15,
    social: 10,
    future: 5,
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    const academics = criteria.academics || {};
    const financials = criteria.financials || {};
    const location = criteria.location || {};
    const social = criteria.social || {};
    const future = criteria.future || {};
    
    if (academics.minGpa || academics.maxGpa) count++;
    if (academics.minSatScore || academics.maxSatScore) count++;
    if (academics.minActScore || academics.maxActScore) count++;
    if (academics.majors && academics.majors.length > 0) count++;
    if (academics.testPolicy) count++;
    if (financials.maxTuition) count++;
    if (financials.minGrantAid) count++;
    if (financials.needsFinancialAid) count++;
    if (location.countries && location.countries.length > 0) count++;
    if (location.states && location.states.length > 0) count++;
    if (location.settings && location.settings.length > 0) count++;
    if (location.climateZones && location.climateZones.length > 0) count++;
    if (social.minStudentLifeScore) count++;
    if (social.minDiversityScore || social.maxDiversityScore) count++;
    if (future.needsVisaSupport) count++;
    if (future.minVisaDuration) count++;
    return count;
  };

  const activeCount = countActiveFilters();

  return (
    <>
      {/* Quick Filters (Default View) */}
      <div className="space-y-4">
        <QuickFilters onAdvancedClick={() => setShowAdvanced(true)} />
        
        {/* Match Precision Toggle */}
        <div className="px-5 pb-2">
          <MatchPrecisionToggle />
        </div>
        
        {/* Category Weights Section - Collapsible */}
        <div className="px-5 pb-5">
          <button
            onClick={() => setShowWeights(!showWeights)}
            className="w-full flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">Customize Match Weights</h4>
              <Badge variant="secondary" className="text-xs">Optional</Badge>
            </div>
            {showWeights ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          {showWeights && (
            <div className="mt-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Adjust how much each category affects your match score (0-100%)
              </p>
              
              {/* Weights Grid */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  { key: 'academic', label: 'Academic', color: 'blue' },
                  { key: 'financial', label: 'Financial', color: 'green' },
                  { key: 'location', label: 'Location', color: 'purple' },
                  { key: 'social', label: 'Social', color: 'pink' },
                  { key: 'future', label: 'Career', color: 'orange' },
                ].map((cat) => (
                  <div key={cat.key} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{cat.label}</span>
                      <span className="text-primary font-semibold">
                        {weights[cat.key as keyof typeof weights]}%
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[weights[cat.key as keyof typeof weights]]}
                      onValueChange={(v) => 
                        setWeights({ [cat.key]: v[0] })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        {activeCount > 0 && (
          <div className="px-5 pb-5">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="w-full h-9 gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal 
        open={showAdvanced} 
        onOpenChange={setShowAdvanced}
      />
    </>
  );
}
