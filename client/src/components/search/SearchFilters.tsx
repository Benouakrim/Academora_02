import { 
  BookOpen, 
  DollarSign, 
  MapPin, 
  Users, 
  Briefcase,
  RotateCcw,
  User
} from 'lucide-react';
import { useSearchStore, type TestPolicy, type CampusSetting } from '@/store/useSearchStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

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

export default function SearchFilters() {
  const {
    criteria,
    setAcademicFilters,
    setFinancialFilters,
    setLocationFilters,
    setSocialFilters,
    setFutureFilters,
    setWeights,
    resetFilters,
    isFieldFromProfile,
  } = useSearchStore();

  const academics = criteria.academics || {};
  const financials = criteria.financials || {};
  const location = criteria.location || {};
  const social = criteria.social || {};
  const future = criteria.future || {};
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
    <div className="space-y-6">
      {/* Header with Reset */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div>
          <h3 className="font-semibold text-base">Filters</h3>
          {activeCount > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeCount} active filter{activeCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 gap-1.5 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      <Separator />

      {/* Tabbed Filters */}
      <Tabs defaultValue="academic" className="w-full px-5 pb-5">
        <TabsList className="w-full grid grid-cols-5 mb-6">
          <TabsTrigger value="academic" className="text-xs gap-1">
            <BookOpen className="h-3 w-3" />
            <span className="hidden sm:inline">Academic</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="text-xs gap-1">
            <DollarSign className="h-3 w-3" />
            <span className="hidden sm:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="text-xs gap-1">
            <MapPin className="h-3 w-3" />
            <span className="hidden sm:inline">Location</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="text-xs gap-1">
            <Users className="h-3 w-3" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="future" className="text-xs gap-1">
            <Briefcase className="h-3 w-3" />
            <span className="hidden sm:inline">Career</span>
          </TabsTrigger>
        </TabsList>

        {/* ACADEMIC TAB */}
        <TabsContent value="academic" className="space-y-6 mt-4">
          {/* GPA and Test Scores - 3 items per row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* GPA Range */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label className="text-sm font-medium">GPA Range</Label>
                {(isFieldFromProfile('academics.minGpa') || isFieldFromProfile('academics.maxGpa')) && <ProfileBadge />}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min="0"
                  max="4.0"
                  step="0.1"
                  placeholder="Min"
                  value={academics.minGpa || ''}
                  onChange={(e) => 
                    setAcademicFilters({ 
                      minGpa: e.target.value ? parseFloat(e.target.value) : undefined 
                    })
                  }
                  className="h-9"
                />
                <Input
                  type="number"
                  min="0"
                  max="4.0"
                  step="0.1"
                  placeholder="Max"
                  value={academics.maxGpa || ''}
                  onChange={(e) => 
                    setAcademicFilters({ 
                      maxGpa: e.target.value ? parseFloat(e.target.value) : undefined 
                    })
                  }
                  className="h-9"
                />
              </div>
            </div>

            {/* SAT Range */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label className="text-sm font-medium">SAT Score</Label>
                {(isFieldFromProfile('academics.minSatScore') || isFieldFromProfile('academics.maxSatScore')) && <ProfileBadge />}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min="400"
                  max="1600"
                  step="10"
                  placeholder="Min"
                  value={academics.minSatScore || ''}
                  onChange={(e) => 
                    setAcademicFilters({ 
                      minSatScore: e.target.value ? parseInt(e.target.value) : undefined 
                    })
                  }
                  className="h-9"
                />
                <Input
                  type="number"
                  min="400"
                  max="1600"
                  step="10"
                  placeholder="Max"
                  value={academics.maxSatScore || ''}
                  onChange={(e) => 
                    setAcademicFilters({ 
                      maxSatScore: e.target.value ? parseInt(e.target.value) : undefined 
                    })
                  }
                  className="h-9"
                />
              </div>
            </div>

            {/* ACT Range */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label className="text-sm font-medium">ACT Score</Label>
                {(isFieldFromProfile('academics.minActScore') || isFieldFromProfile('academics.maxActScore')) && <ProfileBadge />}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min="1"
                  max="36"
                  placeholder="Min"
                  value={academics.minActScore || ''}
                  onChange={(e) => 
                    setAcademicFilters({ 
                      minActScore: e.target.value ? parseInt(e.target.value) : undefined 
                    })
                  }
                  className="h-9"
                />
                <Input
                  type="number"
                  min="1"
                  max="36"
                  placeholder="Max"
                  value={academics.maxActScore || ''}
                  onChange={(e) => 
                    setAcademicFilters({ 
                      maxActScore: e.target.value ? parseInt(e.target.value) : undefined 
                    })
                  }
                  className="h-9"
                />
              </div>
            </div>
          </div>

          {/* Test Policy and Majors - 2 items per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Test Policy */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label className="text-sm font-medium">Test Policy</Label>
                {isFieldFromProfile('academics.testPolicy') && <ProfileBadge />}
              </div>
              <Select 
                value={academics.testPolicy || 'any'} 
                onValueChange={(v) => 
                  setAcademicFilters({ testPolicy: v === 'any' ? undefined : v as TestPolicy })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Policy</SelectItem>
                  <SelectItem value="TEST_OPTIONAL">Test Optional</SelectItem>
                  <SelectItem value="TEST_BLIND">Test Blind</SelectItem>
                  <SelectItem value="TEST_REQUIRED">Test Required</SelectItem>
                  <SelectItem value="TEST_FLEXIBLE">Test Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Majors */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label className="text-sm font-medium">Majors of Interest</Label>
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
                className="h-9"
              />
            </div>
          </div>
        </TabsContent>

        {/* FINANCIAL TAB */}
        <TabsContent value="financial" className="space-y-6 mt-4">
          {/* Sliders - 3 per row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Max Tuition Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Label className="text-sm font-medium">Max Tuition</Label>
                  {isFieldFromProfile('financials.maxTuition') && <ProfileBadge />}
                </div>
                <span className="text-sm font-semibold text-primary">
                  ${(financials.maxTuition || 100000).toLocaleString()}
                </span>
              </div>
              <Slider
                min={0}
                max={100000}
                step={5000}
                value={[financials.maxTuition || 100000]}
                onValueChange={(v) => 
                  setFinancialFilters({ maxTuition: v[0] === 100000 ? undefined : v[0] })
                }
                className="[&_[role=slider]]:bg-green-600"
              />
            </div>

            {/* Min Grant Aid */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Label className="text-sm font-medium">Min Grant Aid</Label>
                  {isFieldFromProfile('financials.minGrantAid') && <ProfileBadge />}
                </div>
                <span className="text-sm font-semibold text-primary">
                  ${(financials.minGrantAid || 0).toLocaleString()}
                </span>
              </div>
              <Slider
                min={0}
                max={50000}
                step={1000}
                value={[financials.minGrantAid || 0]}
                onValueChange={(v) => 
                  setFinancialFilters({ minGrantAid: v[0] === 0 ? undefined : v[0] })
                }
              />
            </div>

            {/* Max Net Cost */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Max Net Cost</Label>
                <span className="text-sm font-semibold text-primary">
                  ${(financials.maxNetCost || 100000).toLocaleString()}
                </span>
              </div>
              <Slider
                min={0}
                max={100000}
                step={5000}
                value={[financials.maxNetCost || 100000]}
                onValueChange={(v) => 
                  setFinancialFilters({ maxNetCost: v[0] === 100000 ? undefined : v[0] })
                }
              />
            </div>
          </div>

          {/* Financial Aid Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="needsAid"
              checked={financials.needsFinancialAid || false}
              onCheckedChange={(checked) => 
                setFinancialFilters({ needsFinancialAid: checked as boolean })
              }
            />
            <Label
              htmlFor="needsAid"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I need financial aid
            </Label>
          </div>
        </TabsContent>

        {/* LOCATION TAB */}
        <TabsContent value="location" className="space-y-6 mt-4">
          {/* Dropdowns - 4 per row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Countries */}
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
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="UK">UK</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campus Setting */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label className="text-sm font-medium">Setting</Label>
                {isFieldFromProfile('location.settings') && <ProfileBadge />}
              </div>
              <Select 
                value={location.settings?.[0] || 'any'}
                onValueChange={(v) => 
                  setLocationFilters({ settings: v === 'any' ? undefined : [v as CampusSetting] })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="URBAN">Urban</SelectItem>
                  <SelectItem value="SUBURBAN">Suburban</SelectItem>
                  <SelectItem value="RURAL">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Climate Zones */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Climate</Label>
              <Select 
                value={location.climateZones?.[0] || 'any'}
                onValueChange={(v) => 
                  setLocationFilters({ climateZones: v === 'any' ? undefined : [v] })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="Temperate">Temperate</SelectItem>
                  <SelectItem value="Tropical">Tropical</SelectItem>
                  <SelectItem value="Arid">Arid</SelectItem>
                  <SelectItem value="Cold">Cold</SelectItem>
                  <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Safety Rating */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Min Safety</Label>
                <span className="text-xs font-semibold text-primary">
                  {location.minSafetyRating ? `${location.minSafetyRating.toFixed(1)}` : 'Any'}
                </span>
              </div>
              <Slider
                min={0}
                max={5}
                step={0.5}
                value={[location.minSafetyRating || 0]}
                onValueChange={(v) => 
                  setLocationFilters({ minSafetyRating: v[0] === 0 ? undefined : v[0] })
                }
              />
            </div>
          </div>
        </TabsContent>

        {/* SOCIAL TAB */}
        <TabsContent value="social" className="space-y-6 mt-4">
          {/* Sliders - 3 per row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Life Score */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Min Student Life</Label>
                <span className="text-sm font-semibold text-primary">
                  {social.minStudentLifeScore ? `${social.minStudentLifeScore.toFixed(1)}` : 'Any'}
                </span>
              </div>
              <Slider
                min={0}
                max={5}
                step={0.5}
                value={[social.minStudentLifeScore || 0]}
                onValueChange={(v) => 
                  setSocialFilters({ minStudentLifeScore: v[0] === 0 ? undefined : v[0] })
                }
              />
            </div>

            {/* Diversity Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Diversity (0-1)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  placeholder="Min"
                  value={social.minDiversityScore || ''}
                  onChange={(e) => 
                    setSocialFilters({ 
                      minDiversityScore: e.target.value ? parseFloat(e.target.value) : undefined 
                    })
                  }
                  className="h-9"
                />
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  placeholder="Max"
                  value={social.maxDiversityScore || ''}
                  onChange={(e) => 
                    setSocialFilters({ 
                      maxDiversityScore: e.target.value ? parseFloat(e.target.value) : undefined 
                    })
                  }
                  className="h-9"
                />
              </div>
            </div>

            {/* Party Scene */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Party Scene (0-5)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  placeholder="Min"
                  value={social.minPartyScene || ''}
                  onChange={(e) => 
                    setSocialFilters({ 
                      minPartyScene: e.target.value ? parseFloat(e.target.value) : undefined 
                    })
                  }
                  className="h-9"
                />
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  placeholder="Max"
                  value={social.maxPartyScene || ''}
                  onChange={(e) => 
                    setSocialFilters({ 
                      maxPartyScene: e.target.value ? parseFloat(e.target.value) : undefined 
                    })
                  }
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* FUTURE/CAREER TAB */}
        <TabsContent value="future" className="space-y-6 mt-4">
          {/* Sliders - 3 per row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Employment Rate */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Min Employment</Label>
                <span className="text-sm font-semibold text-primary">
                  {future.minEmploymentRate 
                    ? `${(future.minEmploymentRate * 100).toFixed(0)}%` 
                    : 'Any'}
                </span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={[future.minEmploymentRate || 0]}
                onValueChange={(v) => 
                  setFutureFilters({ minEmploymentRate: v[0] === 0 ? undefined : v[0] })
                }
              />
            </div>

            {/* Alumni Network */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Min Alumni Network</Label>
                <span className="text-sm font-semibold text-primary">
                  {future.minAlumniNetwork ? `${future.minAlumniNetwork.toFixed(1)}` : 'Any'}
                </span>
              </div>
              <Slider
                min={0}
                max={5}
                step={0.5}
                value={[future.minAlumniNetwork || 0]}
                onValueChange={(v) => 
                  setFutureFilters({ minAlumniNetwork: v[0] === 0 ? undefined : v[0] })
                }
              />
            </div>

            {/* Internship Support */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Min Internship Support</Label>
                <span className="text-sm font-semibold text-primary">
                  {future.minInternshipSupport ? `${future.minInternshipSupport.toFixed(1)}` : 'Any'}
                </span>
              </div>
              <Slider
                min={0}
                max={5}
                step={0.5}
                value={[future.minInternshipSupport || 0]}
                onValueChange={(v) => 
                  setFutureFilters({ minInternshipSupport: v[0] === 0 ? undefined : v[0] })
                }
              />
            </div>
          </div>

          {/* Visa Support - 2 per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="needsVisa"
                checked={future.needsVisaSupport || false}
                onCheckedChange={(checked) => 
                  setFutureFilters({ needsVisaSupport: checked as boolean })
                }
              />
              <Label
                htmlFor="needsVisa"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                I need visa sponsorship
                {isFieldFromProfile('future.needsVisaSupport') && <ProfileBadge />}
              </Label>
            </div>

            {future.needsVisaSupport && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Min Visa Duration (months)</Label>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  placeholder="24"
                  value={future.minVisaDuration || ''}
                  onChange={(e) => 
                    setFutureFilters({ 
                      minVisaDuration: e.target.value ? parseInt(e.target.value) : undefined 
                    })
                  }
                  className="h-9"
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Category Weights Section */}
      <Separator />
      <div className="px-5 pb-5">
        <div className="mb-4">
          <h4 className="text-sm font-semibold">Match Importance Weights</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Adjust how much each category affects your match score
          </p>
        </div>

        {/* Weights in Grid - 5 per row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
    </div>
  );
}
