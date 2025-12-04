import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { FC } from 'react';

interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: FC<{ className?: string }>;
  color: string; // Tailwind color class like 'violet' or 'emerald'
}

const getPriorityLabel = (value: number): string => {
  if (value >= 81) return 'Critical';
  if (value >= 61) return 'High Priority';
  if (value >= 31) return 'Medium';
  return 'Lower Priority';
};

const getPriorityColor = (value: number): string => {
  if (value >= 81) return 'text-pink-600 dark:text-pink-400';
  if (value >= 61) return 'text-purple-600 dark:text-purple-400';
  if (value >= 31) return 'text-blue-600 dark:text-blue-400';
  return 'text-gray-500 dark:text-gray-400';
};

const getTrackGradient = (value: number): string => {
  if (value >= 81) {
    return 'from-purple-500 to-pink-500';
  }
  if (value >= 61) {
    return 'from-purple-400 to-purple-600';
  }
  if (value >= 31) {
    return 'from-blue-400 to-blue-600';
  }
  return 'from-gray-300 to-gray-400';
};

/**
 * WeightSlider Component
 * Interactive slider for adjusting category weights
 * with visual feedback and priority labels
 */
export default function WeightSlider({ 
  label, 
  value, 
  onChange, 
  icon: Icon,
  color 
}: WeightSliderProps) {
  const priorityLabel = getPriorityLabel(value);
  const priorityColor = getPriorityColor(value);
  const trackGradient = getTrackGradient(value);

  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-1.5 rounded-lg bg-opacity-10',
            color === 'violet' && 'bg-violet-100 dark:bg-violet-900/20',
            color === 'emerald' && 'bg-emerald-100 dark:bg-emerald-900/20',
            color === 'blue' && 'bg-blue-100 dark:bg-blue-900/20',
            color === 'pink' && 'bg-pink-100 dark:bg-pink-900/20',
            color === 'amber' && 'bg-amber-100 dark:bg-amber-900/20'
          )}>
            <Icon className={cn(
              'h-4 w-4',
              color === 'violet' && 'text-violet-600 dark:text-violet-400',
              color === 'emerald' && 'text-emerald-600 dark:text-emerald-400',
              color === 'blue' && 'text-blue-600 dark:text-blue-400',
              color === 'pink' && 'text-pink-600 dark:text-pink-400',
              color === 'amber' && 'text-amber-600 dark:text-amber-400'
            )} />
          </div>
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={cn('text-xs font-medium', priorityColor)}>
            {priorityLabel}
          </span>
          <span className="text-lg font-bold text-foreground min-w-[3ch] text-right">
            {value}%
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
        
        {/* Visual Progress Bar (underneath slider) */}
        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full bg-gradient-to-r transition-all duration-300',
              trackGradient
            )}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
}
