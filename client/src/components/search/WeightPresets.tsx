import { Scale, DollarSign, Briefcase, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CategoryWeights } from '@/store/useSearchStore';

interface WeightPresetsProps {
  currentWeights: CategoryWeights;
  onPresetSelect: (weights: CategoryWeights) => void;
}

const PRESETS = {
  BALANCED: {
    name: 'Balanced',
    icon: Scale,
    weights: { academic: 40, financial: 30, location: 15, social: 10, future: 5 },
    description: 'Equal consideration across categories',
    color: 'gray',
  },
  ACADEMIC: {
    name: 'Academic Focus',
    icon: GraduationCap,
    weights: { academic: 45, financial: 25, location: 10, social: 10, future: 10 },
    description: 'Prioritize academic rigor and quality',
    color: 'violet',
  },
  BUDGET: {
    name: 'Budget Priority',
    icon: DollarSign,
    weights: { academic: 20, financial: 45, location: 15, social: 10, future: 10 },
    description: 'Emphasize affordability and financial aid',
    color: 'emerald',
  },
  SOCIAL: {
    name: 'Social Butterfly',
    icon: Users,
    weights: { academic: 25, financial: 25, location: 10, social: 30, future: 10 },
    description: 'Focus on campus life and community',
    color: 'pink',
  },
  CAREER: {
    name: 'Career Focused',
    icon: Briefcase,
    weights: { academic: 25, financial: 20, location: 10, social: 10, future: 35 },
    description: 'Optimize for employment outcomes',
    color: 'amber',
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
 * Helps users select smart starting points instead of raw sliders
 */
export default function WeightPresets({ currentWeights, onPresetSelect }: WeightPresetsProps) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">Quick Presets</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Select a starting point, then fine-tune with sliders below
        </p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        {Object.values(PRESETS).map((preset) => {
          const Icon = preset.icon;
          const isActive = weightsMatch(currentWeights, preset.weights);
          
          return (
            <Button
              key={preset.name}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPresetSelect(preset.weights)}
              className={cn(
                "h-auto flex-col items-start py-3 gap-1.5 transition-all",
                isActive && "shadow-md",
                !isActive && "hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <div className={cn(
                  "p-1.5 rounded-md",
                  preset.color === 'gray' && "bg-gray-100 dark:bg-gray-800",
                  preset.color === 'violet' && "bg-violet-100 dark:bg-violet-900/30",
                  preset.color === 'emerald' && "bg-emerald-100 dark:bg-emerald-900/30",
                  preset.color === 'pink' && "bg-pink-100 dark:bg-pink-900/30",
                  preset.color === 'amber' && "bg-amber-100 dark:bg-amber-900/30"
                )}>
                  <Icon className={cn(
                    "h-3.5 w-3.5",
                    preset.color === 'gray' && "text-gray-600 dark:text-gray-400",
                    preset.color === 'violet' && "text-violet-600 dark:text-violet-400",
                    preset.color === 'emerald' && "text-emerald-600 dark:text-emerald-400",
                    preset.color === 'pink' && "text-pink-600 dark:text-pink-400",
                    preset.color === 'amber' && "text-amber-600 dark:text-amber-400"
                  )} />
                </div>
                <span className="text-xs font-semibold">{preset.name}</span>
              </div>
              <span className="text-[10px] text-left text-muted-foreground font-normal leading-tight line-clamp-2">
                {preset.description}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
