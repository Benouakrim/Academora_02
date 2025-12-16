import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useSearchStore } from '@/store/useSearchStore';
import { Badge } from '@/components/ui/badge';
import MatchPrecisionToggle from './MatchPrecisionToggle';
import WeightPresets from './WeightPresets';

interface ViewModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * ViewModeModal Component
 * Allows users to switch between Browse and Best Match modes
 * Best Match mode shows customizable weight parameters
 */
export default function ViewModeModal({ open, onOpenChange }: ViewModeModalProps) {
  const { viewMode, setViewMode, criteria, setWeights } = useSearchStore();
  const [selectedMode, setSelectedMode] = useState<'BROWSE' | 'MATCH'>(viewMode);
  const [tempWeights, setTempWeights] = useState(
    criteria.weights || {
      academic: 40,
      financial: 30,
      location: 15,
      social: 10,
      future: 5,
    }
  );

  const handleApplyChanges = () => {
    setViewMode(selectedMode);
    if (selectedMode === 'MATCH') {
      setWeights(tempWeights);
    }
    onOpenChange(false);
  };

  const categoryConfigs = [
    { key: 'academic' as const, label: 'Academic', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    { key: 'financial' as const, label: 'Financial', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    { key: 'location' as const, label: 'Location', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
    { key: 'social' as const, label: 'Social', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' },
    { key: 'future' as const, label: 'Career', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Search Mode</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Choose how you want to search for universities
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 sm:space-y-8">
          {/* Mode Selection */}
          <div className="space-y-4 sm:space-y-5">
            <RadioGroup value={selectedMode} onValueChange={(value) => setSelectedMode(value as 'BROWSE' | 'MATCH')}>
              {/* Browse Mode */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-3 cursor-pointer p-3 sm:p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all" onClick={() => setSelectedMode('BROWSE')}>
                  <RadioGroupItem value="BROWSE" id="browse-mode" />
                  <Label htmlFor="browse-mode" className="cursor-pointer font-semibold flex-1 text-base sm:text-lg">
                    Browse
                  </Label>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground ml-10">
                  Explore universities using standard filters like tuition, location, academics, and more. No personalization needed.
                </p>
              </div>

              {/* Best Match Mode */}
              <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-5">
                <div className="flex items-center space-x-3 cursor-pointer p-3 sm:p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all" onClick={() => setSelectedMode('MATCH')}>
                  <RadioGroupItem value="MATCH" id="match-mode" />
                  <Label htmlFor="match-mode" className="cursor-pointer font-semibold flex-1 text-base sm:text-lg">
                    Best Match
                  </Label>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground ml-10">
                  Get personalized university recommendations based on your profile and preferences. Adjust how each category influences your matches.
                </p>
              </div>
            </RadioGroup>
          </div>

          {/* Best Match Parameters */}
          {selectedMode === 'MATCH' && (
            <div className="space-y-5 sm:space-y-6 p-4 sm:p-5 md:p-6 bg-muted/30 rounded-lg border border-border">
              <h4 className="font-semibold text-base sm:text-lg">Match Settings</h4>
              
              {/* Match Precision Toggle - Quick Preset */}
              <div className="mb-2 sm:mb-4">
                <MatchPrecisionToggle />
              </div>

              <h4 className="font-semibold text-base sm:text-lg mt-4 sm:mt-6">Customize Match Weights</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                Adjust how much each category affects your match score (0-100%)
              </p>

              {/* Weight Presets */}
              <WeightPresets 
                currentWeights={tempWeights}
                onPresetSelect={(presetWeights) => setTempWeights(presetWeights)}
              />

              <div className="space-y-4 sm:space-y-5">
                {categoryConfigs.map((cat) => (
                  <div key={cat.key} className="space-y-2 sm:space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-medium">{cat.label}</span>
                      <Badge className={cat.color + ' font-semibold text-xs sm:text-sm'}>
                        {tempWeights[cat.key]}%
                      </Badge>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[tempWeights[cat.key]]}
                      onValueChange={(v) =>
                        setTempWeights({ ...tempWeights, [cat.key]: v[0] })
                      }
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded text-xs sm:text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <strong>Tip:</strong> Total doesn't need to equal 100%. The system will normalize your weights automatically.
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 sm:pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedMode(viewMode);
              setTempWeights(
                criteria.weights || {
                  academic: 40,
                  financial: 30,
                  location: 15,
                  social: 10,
                  future: 5,
                }
              );
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleApplyChanges} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
