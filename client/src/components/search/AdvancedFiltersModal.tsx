import {
  BookOpen,
  DollarSign,
  MapPin,
  Users,
  Briefcase,
} from 'lucide-react';
import { useSearchStore, type TestPolicy, type CampusSetting } from '@/store/useSearchStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

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

interface AdvancedFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * AdvancedFiltersModal Component
 * Modal containing all advanced filtering options organized by category tabs
 * Reduces complexity by hiding these from the main view
 */
export default function AdvancedFiltersModal({ open, onOpenChange }: AdvancedFiltersModalProps) {
  const {
    criteria,
    setAcademicFilters,
    setFinancialFilters,
    setLocationFilters,
    setSocialFilters,
    setFutureFilters,
    isFieldFromProfile,
  } = useSearchStore();

  const academics = criteria.academics || {};
  const financials = criteria.financials || {};
  const location = criteria.location || {};
  const social = criteria.social || {};
  const future = criteria.future || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Advanced Search Filters</DialogTitle>
          <DialogDescription>
            Fine-tune your search with additional criteria across all categories
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-140px)]">
          <div className="px-6 pb-6">
            <Tabs defaultValue="academics" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="academics" className="gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Academic</span>
                </TabsTrigger>
                <TabsTrigger value="financial" className="gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Financial</span>
                </TabsTrigger>
                <TabsTrigger value="location" className="gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Location</span>
                </TabsTrigger>
                <TabsTrigger value="social" className="gap-1.5">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Social</span>
                </TabsTrigger>
                <TabsTrigger value="future" className="gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Career</span>
                </TabsTrigger>
              </TabsList>

              {/* ACADEMICS TAB */}
              <TabsContent value="academics" className="space-y-6">
                {/* ACT Score Range */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-sm font-medium">ACT Score Range</Label>
                    {(isFieldFromProfile('academics.minActScore') || isFieldFromProfile('academics.maxActScore')) && <ProfileBadge />}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="36"
                      placeholder="Min ACT"
                      value={academics.minActScore || ''}
                      onChange={(e) =>
                        setAcademicFilters({
                          minActScore: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      className="h-9"
                    />
                    <Input
                      type="number"
                      min="1"
                      max="36"
                      placeholder="Max ACT"
                      value={academics.maxActScore || ''}
                      onChange={(e) =>
                        setAcademicFilters({
                          maxActScore: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      className="h-9"
                    />
                  </div>
                </div>

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
              </TabsContent>

              {/* FINANCIAL TAB */}
              <TabsContent value="financial" className="space-y-6">
                {/* Min Grant Aid Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Label className="text-sm font-medium">Minimum Grant Aid</Label>
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
                    <Label className="text-sm font-medium">Maximum Net Cost</Label>
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
              <TabsContent value="location" className="space-y-6">
                {/* Campus Setting */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-sm font-medium">Campus Setting</Label>
                    {isFieldFromProfile('location.settings') && <ProfileBadge />}
                  </div>
                  <Select
                    value={location.settings?.[0] || 'any'}
                    onValueChange={(v) =>
                      setLocationFilters({ settings: v === 'any' ? undefined : [v as CampusSetting] })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Any setting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Setting</SelectItem>
                      <SelectItem value="URBAN">Urban</SelectItem>
                      <SelectItem value="SUBURBAN">Suburban</SelectItem>
                      <SelectItem value="RURAL">Rural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Climate Zones */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Climate Zone</Label>
                  <Select
                    value={location.climateZones?.[0] || 'any'}
                    onValueChange={(v) =>
                      setLocationFilters({ climateZones: v === 'any' ? undefined : [v] })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Any climate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Climate</SelectItem>
                      <SelectItem value="Temperate">Temperate</SelectItem>
                      <SelectItem value="Tropical">Tropical</SelectItem>
                      <SelectItem value="Arid">Arid</SelectItem>
                      <SelectItem value="Cold">Cold</SelectItem>
                      <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Safety Rating */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Minimum Safety Rating</Label>
                    <span className="text-xs font-semibold text-primary">
                      {location.minSafetyRating ? `${location.minSafetyRating.toFixed(1)}/5` : 'Any'}
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
              </TabsContent>

              {/* SOCIAL TAB */}
              <TabsContent value="social" className="space-y-6">
                {/* Student Life Score */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Minimum Student Life Score</Label>
                    <span className="text-sm font-semibold text-primary">
                      {social.minStudentLifeScore ? `${social.minStudentLifeScore.toFixed(1)}/5` : 'Any'}
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
                  <Label className="text-sm font-medium">Diversity Score (0-1)</Label>
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
                          minDiversityScore: e.target.value ? parseFloat(e.target.value) : undefined,
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
                          maxDiversityScore: e.target.value ? parseFloat(e.target.value) : undefined,
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
                          minPartyScene: e.target.value ? parseFloat(e.target.value) : undefined,
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
                          maxPartyScene: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className="h-9"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* FUTURE/CAREER TAB */}
              <TabsContent value="future" className="space-y-6">
                {/* Employment Rate */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Minimum Employment Rate</Label>
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
                    <Label className="text-sm font-medium">Minimum Alumni Network Score</Label>
                    <span className="text-sm font-semibold text-primary">
                      {future.minAlumniNetwork ? `${future.minAlumniNetwork.toFixed(1)}/5` : 'Any'}
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
                    <Label className="text-sm font-medium">Minimum Internship Support</Label>
                    <span className="text-sm font-semibold text-primary">
                      {future.minInternshipSupport ? `${future.minInternshipSupport.toFixed(1)}/5` : 'Any'}
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

                {/* Visa Support */}
                <div className="space-y-4">
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
                      <Label className="text-sm font-medium">Minimum Visa Duration (months)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="60"
                        placeholder="24"
                        value={future.minVisaDuration || ''}
                        onChange={(e) =>
                          setFutureFilters({
                            minVisaDuration: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        className="h-9"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
