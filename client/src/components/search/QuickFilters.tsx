import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Sliders } from 'lucide-react';
import { useSearchStore } from '@/store/useSearchStore';
import { Button } from '@/components/ui/button';

/**
 * Profile Badge - Shows "From Profile" indicator
 */
function ProfileBadge() {
  return (
    <Badge 
      variant="secondary" 
      className="ml-2 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
    >
      <User className="h-3 w-3 mr-1" />
      From Profile
    </Badge>
  );
}

interface QuickFiltersProps {
  onAdvancedClick: () => void;
}

/**
 * QuickFilters Component
 * Displays only essential 4-5 filters for a simplified search experience
 * Reduces cognitive load by hiding advanced filters behind a button
 */
export default function QuickFilters({ onAdvancedClick }: QuickFiltersProps) {
  const {
    criteria,
    setAcademicFilters,
    setFinancialFilters,
    setLocationFilters,
    isFieldFromProfile,
  } = useSearchStore();

  const academics = criteria.academics || {};
  const financials = criteria.financials || {};
  const location = criteria.location || {};

  // Count active advanced filters (not shown in quick view)
  const countAdvancedFilters = () => {
    let count = 0;
    
    // Academic advanced filters
    if (academics.minActScore || academics.maxActScore) count++;
    if (academics.testPolicy) count++;
    
    // Financial advanced filters
    if (financials.minGrantAid) count++;
    if (financials.maxNetCost) count++;
    if (financials.needsFinancialAid) count++;
    
    // Location advanced filters
    if (location.states && location.states.length > 0) count++;
    if (location.cities && location.cities.length > 0) count++;
    if (location.settings && location.settings.length > 0) count++;
    if (location.climateZones && location.climateZones.length > 0) count++;
    if (location.minSafetyRating) count++;
    
    // Social filters (all advanced)
    const social = criteria.social || {};
    if (social.minStudentLifeScore) count++;
    if (social.minDiversityScore || social.maxDiversityScore) count++;
    if (social.minPartyScene || social.maxPartyScene) count++;
    
    // Future filters (all advanced)
    const future = criteria.future || {};
    if (future.minEmploymentRate) count++;
    if (future.minAlumniNetwork) count++;
    if (future.minInternshipSupport) count++;
    if (future.needsVisaSupport) count++;
    if (future.minVisaDuration) count++;
    
    return count;
  };

  const advancedCount = countAdvancedFilters();

  return (
    <div className="space-y-6 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">Quick Search</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Essential filters to find your ideal university
          </p>
        </div>
      </div>

      {/* Quick Filters Grid - 2 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Major/Program */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label className="text-sm font-medium">Major or Program</Label>
            {isFieldFromProfile('academics.majors') && <ProfileBadge />}
          </div>
          <Input
            placeholder="e.g., Computer Science, Business"
            value={academics.majors?.join(', ') || ''}
            onChange={(e) => {
              const majors = e.target.value
                .split(',')
                .map(m => m.trim())
                .filter(m => m.length > 0);
              setAcademicFilters({ majors: majors.length > 0 ? majors : undefined });
            }}
            className="h-10"
          />
        </div>

        {/* 2. Max Tuition Budget */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label className="text-sm font-medium">Max Tuition Budget</Label>
            {isFieldFromProfile('financials.maxTuition') && <ProfileBadge />}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">$</span>
            <Input
              type="number"
              min="0"
              max="100000"
              step="5000"
              placeholder="50000"
              value={financials.maxTuition || ''}
              onChange={(e) =>
                setFinancialFilters({
                  maxTuition: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="h-10"
            />
          </div>
        </div>

        {/* 3. GPA Range */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label className="text-sm font-medium">Your GPA Range</Label>
            {(isFieldFromProfile('academics.minGpa') || isFieldFromProfile('academics.maxGpa')) && <ProfileBadge />}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min="0"
              max="5"
              step="0.1"
              placeholder="Min GPA"
              value={academics.minGpa || ''}
              onChange={(e) =>
                setAcademicFilters({
                  minGpa: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="h-10"
            />
            <Input
              type="number"
              min="0"
              max="5"
              step="0.1"
              placeholder="Max GPA"
              value={academics.maxGpa || ''}
              onChange={(e) =>
                setAcademicFilters({
                  maxGpa: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="h-10"
            />
          </div>
        </div>

        {/* 4. SAT Score Range */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label className="text-sm font-medium">SAT Score Range</Label>
            {(isFieldFromProfile('academics.minSatScore') || isFieldFromProfile('academics.maxSatScore')) && <ProfileBadge />}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min="400"
              max="1600"
              step="10"
              placeholder="Min SAT"
              value={academics.minSatScore || ''}
              onChange={(e) =>
                setAcademicFilters({
                  minSatScore: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="h-10"
            />
            <Input
              type="number"
              min="400"
              max="1600"
              step="10"
              placeholder="Max SAT"
              value={academics.maxSatScore || ''}
              onChange={(e) =>
                setAcademicFilters({
                  maxSatScore: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="h-10"
            />
          </div>
        </div>

        {/* 5. Country Preference */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label className="text-sm font-medium">Country</Label>
            {isFieldFromProfile('location.countries') && <ProfileBadge />}
          </div>
          <Select
            value={location.countries?.[0] || 'any'}
            onValueChange={(v) =>
              setLocationFilters({ countries: v === 'any' ? undefined : [v] })
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Any country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Country</SelectItem>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
              <SelectItem value="France">France</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters Button */}
      <div className="pt-4 border-t">
        <Button
          variant="outline"
          onClick={onAdvancedClick}
          className="w-full justify-between h-11"
        >
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <span className="font-medium">Advanced Filters</span>
          </div>
          {advancedCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {advancedCount} active
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
}
