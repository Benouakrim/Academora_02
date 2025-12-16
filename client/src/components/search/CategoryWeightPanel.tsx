import { useState } from 'react';
import { ChevronDown, ChevronUp, Scale, Info } from 'lucide-react';
import { GraduationCap, DollarSign, MapPin, Heart, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useSearchStore } from '@/store/useSearchStore';
import WeightSlider from '@/components/search/WeightSlider';
import WeightPresets from '@/components/search/WeightPresets';
import { useDebounce } from 'use-debounce';
import { useEffect } from 'react';

/**
 * CategoryWeightPanel Component
 * Collapsible panel for adjusting match category weights
 * Only shown in MATCH mode
 */
export default function CategoryWeightPanel() {
  const { criteria, setWeights } = useSearchStore();
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Local state for immediate UI updates
  const [localWeights, setLocalWeights] = useState(
    criteria.weights || {
      academic: 60,
      financial: 60,
      location: 60,
      social: 60,
      future: 60,
    }
  );

  // Debounce weight updates to prevent excessive re-renders
  const [debouncedWeights] = useDebounce(localWeights, 200);

  // Apply debounced weights to store
  useEffect(() => {
    setWeights(debouncedWeights);
  }, [debouncedWeights]);

  const handleWeightChange = (category: keyof typeof localWeights, value: number) => {
    setLocalWeights((prev) => ({ ...prev, [category]: value }));
  };

  const handlePresetSelect = (presetWeights: typeof localWeights) => {
    setLocalWeights(presetWeights);
  };

  const handleReset = () => {
    const defaultWeights = {
      academic: 60,
      financial: 60,
      location: 60,
      social: 60,
      future: 60,
    };
    setLocalWeights(defaultWeights);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-2 border-purple-200 dark:border-purple-800/50 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-foreground">Customize Your Priorities</h3>
            <p className="text-sm text-muted-foreground">
              Adjust importance of each category for better matches
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isExpanded && (
            <span className="text-xs text-muted-foreground mr-2">
              {Object.values(localWeights).some(v => v !== 60) ? 'Custom' : 'Balanced'}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6 bg-white/50 dark:bg-black/20">
              {/* Info Banner */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
                  Higher weights make that category more important in your match score. 
                  Total doesn't need to equal 100 — adjust based on what matters most to you.
                </p>
              </div>

              {/* Quick Presets */}
              <WeightPresets 
                currentWeights={localWeights}
                onPresetSelect={handlePresetSelect}
              />

              {/* Weight Sliders */}
              <div className="space-y-5">
                <WeightSlider
                  label="Academic Match"
                  value={localWeights.academic}
                  onChange={(value) => handleWeightChange('academic', value)}
                  icon={GraduationCap}
                  color="violet"
                />
                
                <WeightSlider
                  label="Financial Fit"
                  value={localWeights.financial}
                  onChange={(value) => handleWeightChange('financial', value)}
                  icon={DollarSign}
                  color="emerald"
                />
                
                <WeightSlider
                  label="Location Preference"
                  value={localWeights.location}
                  onChange={(value) => handleWeightChange('location', value)}
                  icon={MapPin}
                  color="blue"
                />
                
                <WeightSlider
                  label="Social Environment"
                  value={localWeights.social}
                  onChange={(value) => handleWeightChange('social', value)}
                  icon={Heart}
                  color="pink"
                />
                
                <WeightSlider
                  label="Career & Future"
                  value={localWeights.future}
                  onChange={(value) => handleWeightChange('future', value)}
                  icon={Briefcase}
                  color="amber"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-muted-foreground"
                >
                  Reset to Defaults
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  Changes apply automatically
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
