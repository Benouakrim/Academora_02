import { Scale, DollarSign, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CategoryWeights } from '@/store/useSearchStore';

interface WeightPresetsProps {
  currentWeights: CategoryWeights;
  onPresetSelect: (weights: CategoryWeights) => void;
}

const PRESETS = {
  BALANCED: {
    name: 'Balanced',
    icon: Scale,
    weights: { academic: 60, financial: 60, location: 60, social: 60, future: 60 },
    description: 'Equal importance across all categories',
  },
  BUDGET: {
    name: 'Budget-Focused',
    icon: DollarSign,
    weights: { academic: 40, financial: 90, location: 50, social: 30, future: 50 },
    description: 'Prioritize affordability and financial aid',
  },
  CAREER: {
    name: 'Career-Driven',
    icon: Briefcase,
    weights: { academic: 70, financial: 50, location: 40, social: 30, future: 95 },
    description: 'Focus on employment and career outcomes',
  },
  ACADEMIC: {
    name: 'Academic Excellence',
    icon: GraduationCap,
    weights: { academic: 95, financial: 40, location: 30, social: 40, future: 70 },
    description: 'Prioritize academic quality and prestige',
  },
};

const weightsMatch = (w1: CategoryWeights, w2: CategoryWeights): boolean => {
  return (
    w1.academic === w2.academic &&
    w1.financial === w2.financial &&
    w1.location === w2.location &&
    w1.social === w2.social &&
    w1.future === w2.future
  );
};

/**
 * WeightPresets Component
 * Quick preset buttons for common weight configurations
 */
export default function WeightPresets({ currentWeights, onPresetSelect }: WeightPresetsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground">Quick Presets</h4>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {Object.values(PRESETS).map((preset) => {
          const Icon = preset.icon;
          const isActive = weightsMatch(currentWeights, preset.weights);
          
          return (
            <Button
              key={preset.name}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPresetSelect(preset.weights)}
              className="h-auto flex-col items-start py-3 gap-1.5"
            >
              <div className="flex items-center gap-2 w-full">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-semibold">{preset.name}</span>
              </div>
              <span className="text-[10px] text-left text-muted-foreground font-normal leading-tight">
                {preset.description}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
