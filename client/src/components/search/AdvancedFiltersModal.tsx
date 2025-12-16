import {
  BookOpen,
  DollarSign,
  MapPin,
  Users,
  Briefcase,
  RotateCcw,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
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

/**
 * Count active filters in a section
 */
function countActiveFilters(filters: Record<string, unknown>): number {
  if (!filters) return 0;
  
  return Object.values(filters).reduce((count, value) => {
    // Skip falsy values, empty arrays/objects
    if (!value) return count;
    if (Array.isArray(value) && value.length === 0) return count;
    if (typeof value === 'object' && Object.keys(value as Record<string, unknown>).length === 0) return count;
    
    // Special case: default ranges don't count as active
    if (typeof value === 'number') {
      // Sliders at default 0 or 100000 don't count
      if (value === 0 || value === 100000 || value === 1) return count;
    }
    
    return count + 1;
  }, 0);
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
  const [activeTab, setActiveTab] = useState('academics');
  
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

  // Count active filters for each tab
  const academicsCount = countActiveFilters(academics);
  const financialsCount = countActiveFilters(financials);
  const locationCount = countActiveFilters(location);
  const socialCount = countActiveFilters(social);
  const futureCount = countActiveFilters(future);
  const totalCount = academicsCount + financialsCount + locationCount + socialCount + futureCount;

  // Reset functions
  const resetAcademicFilters = () => {
    setAcademicFilters({
      minActScore: undefined,
      maxActScore: undefined,
      testPolicy: undefined,
    });
  };

  const resetFinancialFilters = () => {
    setFinancialFilters({
      minGrantAid: undefined,
      maxNetCost: undefined,
      needsFinancialAid: undefined,
    });
  };

  const resetLocationFilters = () => {
    setLocationFilters({
      settings: undefined,
      climateZones: undefined,
      minSafetyRating: undefined,
    });
  };

  const resetSocialFilters = () => {
    setSocialFilters({
      minStudentLifeScore: undefined,
      minDiversityScore: undefined,
      maxDiversityScore: undefined,
      minPartyScene: undefined,
      maxPartyScene: undefined,
    });
  };

  const resetFutureFilters = () => {
    setFutureFilters({
      minEmploymentRate: undefined,
      minAlumniNetwork: undefined,
      minInternshipSupport: undefined,
      needsVisaSupport: undefined,
      minVisaDuration: undefined,
    });
  };

  const resetAllFilters = () => {
    resetAcademicFilters();
    resetFinancialFilters();
    resetLocationFilters();
    resetSocialFilters();
    resetFutureFilters();
  };

  // Manage scroll lock when modal opens/closes
  useEffect(() => {
    if (open) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      
      // Disable scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
    } else {
      // Get the scroll position from the style
      const scrollY = parseInt(document.body.style.top || '0') * -1;
      
      // Re-enable scroll
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
      document.body.style.top = 'unset';
      
      // Restore scroll position
      window.scrollTo(0, scrollY);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
      document.body.style.top = 'unset';
    };
  }, [open]);

  // Disable body scroll when modal is open
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 rounded-xl border-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                Advanced Search Filters
              </DialogTitle>
              <DialogDescription className="mt-1">
                Fine-tune your search with additional criteria across all categories
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {totalCount > 0 && (
                <Badge
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-full"
                >
                  {totalCount} active
                </Badge>
              )}
              <button
                onClick={() => handleOpenChange(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)]">
          <div className="px-6 pb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mb-6 space-y-3">
                <TabsList className="grid w-full grid-cols-5 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <TabsTrigger 
                    value="academics"
                    className="gap-1.5 relative transition-all data-[state=active]:shadow-md"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Academic</span>
                    {academicsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {academicsCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="financial"
                    className="gap-1.5 relative transition-all data-[state=active]:shadow-md"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">Financial</span>
                    {financialsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {financialsCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="location"
                    className="gap-1.5 relative transition-all data-[state=active]:shadow-md"
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="hidden sm:inline">Location</span>
                    {locationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {locationCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="social"
                    className="gap-1.5 relative transition-all data-[state=active]:shadow-md"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Social</span>
                    {socialCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {socialCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="future"
                    className="gap-1.5 relative transition-all data-[state=active]:shadow-md"
                  >
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden sm:inline">Career</span>
                    {futureCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {futureCount}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                {/* Tab-specific reset button */}
                <div className="flex justify-between items-center px-2">
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {activeTab === 'academics' && 'Academic Requirements'}
                    {activeTab === 'financial' && 'Financial Information'}
                    {activeTab === 'location' && 'Campus Location & Environment'}
                    {activeTab === 'social' && 'Student Life & Campus Culture'}
                    {activeTab === 'future' && 'Career & Future Opportunities'}
                  </div>
                  <button
                    onClick={() => {
                      if (activeTab === 'academics') resetAcademicFilters();
                      else if (activeTab === 'financial') resetFinancialFilters();
                      else if (activeTab === 'location') resetLocationFilters();
                      else if (activeTab === 'social') resetSocialFilters();
                      else if (activeTab === 'future') resetFutureFilters();
                    }}
                    className="text-xs text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors flex items-center gap-1 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                    title="Reset this tab's filters"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Tab
                  </button>
                </div>
              </div>

              {/* ACADEMICS TAB */}
              <TabsContent value="academics" className="space-y-6 py-2">
                {/* ACT Score Range */}
                <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">ACT Score Range</Label>
                    {(isFieldFromProfile('academics.minActScore') || isFieldFromProfile('academics.maxActScore')) && <ProfileBadge />}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Minimum</Label>
                      <Input
                        type="number"
                        min="1"
                        max="36"
                        placeholder="1"
                        value={academics.minActScore || ''}
                        onChange={(e) =>
                          setAcademicFilters({
                            minActScore: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Maximum</Label>
                      <Input
                        type="number"
                        min="1"
                        max="36"
                        placeholder="36"
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
                </div>

                {/* Test Policy */}
                <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Test Policy</Label>
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
              <TabsContent value="financial" className="space-y-6 py-2">
                {/* Min Grant Aid Slider */}
                <div className="space-y-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Minimum Grant Aid</Label>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
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
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>$0</span>
                    <span>$50,000</span>
                  </div>
                </div>

                {/* Max Net Cost */}
                <div className="space-y-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Maximum Net Cost</Label>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
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
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>$0</span>
                    <span>$100,000</span>
                  </div>
                </div>

                {/* Financial Aid Checkbox */}
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="needsAid"
                      checked={financials.needsFinancialAid || false}
                      onCheckedChange={(checked) =>
                        setFinancialFilters({ needsFinancialAid: checked as boolean })
                      }
                      className="h-5 w-5"
                    />
                    <Label
                      htmlFor="needsAid"
                      className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer leading-none"
                    >
                      I need financial aid
                    </Label>
                  </div>
                </div>
              </TabsContent>

              {/* LOCATION TAB */}
              <TabsContent value="location" className="space-y-6 py-2">
                {/* Campus Setting */}
                <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Campus Setting</Label>
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
                <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Climate Zone</Label>
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
                <div className="space-y-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Minimum Safety Rating</Label>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
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
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>0</span>
                    <span>5</span>
                  </div>
                </div>
              </TabsContent>

              {/* SOCIAL TAB */}
              <TabsContent value="social" className="space-y-6 py-2">
                {/* Student Life Score */}
                <div className="space-y-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Minimum Student Life Score</Label>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
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
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>0</span>
                    <span>5</span>
                  </div>
                </div>

                {/* Diversity Range */}
                <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Diversity Score Range (0-1)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Minimum</Label>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        placeholder="0"
                        value={social.minDiversityScore || ''}
                        onChange={(e) =>
                          setSocialFilters({
                            minDiversityScore: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Maximum</Label>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        placeholder="1"
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
                </div>

                {/* Party Scene */}
                <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Party Scene Range (0-5)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Minimum</Label>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.5"
                        placeholder="0"
                        value={social.minPartyScene || ''}
                        onChange={(e) =>
                          setSocialFilters({
                            minPartyScene: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Maximum</Label>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.5"
                        placeholder="5"
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
                </div>
              </TabsContent>

              {/* FUTURE/CAREER TAB */}
              <TabsContent value="future" className="space-y-6 py-2">
                {/* Employment Rate */}
                <div className="space-y-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Minimum Employment Rate</Label>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
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
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Alumni Network */}
                <div className="space-y-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Minimum Alumni Network Score</Label>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
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
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>0</span>
                    <span>5</span>
                  </div>
                </div>

                {/* Internship Support */}
                <div className="space-y-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Minimum Internship Support</Label>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
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
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>0</span>
                    <span>5</span>
                  </div>
                </div>

                {/* Visa Support */}
                <div className="space-y-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="needsVisa"
                      checked={future.needsVisaSupport || false}
                      onCheckedChange={(checked) =>
                        setFutureFilters({ needsVisaSupport: checked as boolean })
                      }
                      className="h-5 w-5"
                    />
                    <Label
                      htmlFor="needsVisa"
                      className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-none cursor-pointer flex items-center gap-2"
                    >
                      I need visa sponsorship
                      {isFieldFromProfile('future.needsVisaSupport') && <ProfileBadge />}
                    </Label>
                  </div>

                  {future.needsVisaSupport && (
                    <div className="space-y-2 pl-8 pt-2 border-l-2 border-blue-300 dark:border-blue-700">
                      <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">Minimum Visa Duration (months)</Label>
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

        <div className="px-6 py-4 border-t bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 flex justify-between items-center gap-4 rounded-b-xl">
          <Button
            onClick={resetAllFilters}
            variant="outline"
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800"
            disabled={totalCount === 0}
          >
            <RotateCcw className="h-4 w-4" />
            Reset All Filters
          </Button>
          <Button
            onClick={() => handleOpenChange(false)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white gap-2"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
