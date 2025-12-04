import { GraduationCap, DollarSign, MapPin, Heart, Briefcase, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UniversityMatchResult } from '@/hooks/useUniversitySearch';

interface MatchBreakdownPanelProps {
  result: UniversityMatchResult;
  isExpanded?: boolean;
}

const CATEGORY_CONFIG = {
  academic: {
    icon: GraduationCap,
    label: 'Academic Match',
    color: 'violet',
  },
  financial: {
    icon: DollarSign,
    label: 'Financial Fit',
    color: 'emerald',
  },
  location: {
    icon: MapPin,
    label: 'Location Preference',
    color: 'blue',
  },
  social: {
    icon: Heart,
    label: 'Social Environment',
    color: 'pink',
  },
  future: {
    icon: Briefcase,
    label: 'Career & Future',
    color: 'amber',
  },
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

const getBarColor = (score: number): string => {
  if (score >= 80) return 'from-emerald-400 to-emerald-600';
  if (score >= 60) return 'from-blue-400 to-blue-600';
  if (score >= 40) return 'from-amber-400 to-amber-600';
  return 'from-red-400 to-red-600';
};

const getReasons = (
  category: keyof typeof CATEGORY_CONFIG,
  score: number,
  university: UniversityMatchResult['university']
): { text: string; type: 'success' | 'warning' }[] => {
  // This is a simplified version - in production, this would come from backend
  const reasons: { text: string; type: 'success' | 'warning' }[] = [];
  
  if (category === 'academic') {
    if (score >= 80) {
      reasons.push({ text: 'Your qualifications exceed requirements', type: 'success' });
      reasons.push({ text: 'Strong fit for your intended major', type: 'success' });
    } else if (score >= 60) {
      reasons.push({ text: 'Your profile meets core requirements', type: 'success' });
    } else {
      reasons.push({ text: 'Requirements may be challenging', type: 'warning' });
    }
  }
  
  if (category === 'financial') {
    if (score >= 80) {
      reasons.push({ text: 'Tuition within your budget range', type: 'success' });
      reasons.push({ text: 'Strong financial aid available', type: 'success' });
    } else if (score >= 60) {
      reasons.push({ text: 'Affordable with financial aid', type: 'success' });
    } else {
      reasons.push({ text: 'Higher cost than your budget', type: 'warning' });
    }
  }
  
  if (category === 'location') {
    if (score >= 80) {
      reasons.push({ text: 'Matches your location preferences', type: 'success' });
      reasons.push({ text: 'Good safety and climate ratings', type: 'success' });
    } else if (score < 60) {
      reasons.push({ text: 'Different setting than preferred', type: 'warning' });
    }
  }
  
  if (category === 'social') {
    if (score >= 70) {
      reasons.push({ text: 'Vibrant campus life and community', type: 'success' });
      reasons.push({ text: 'Strong diversity and inclusion', type: 'success' });
    }
  }
  
  if (category === 'future') {
    if (score >= 80) {
      if (university.employmentRate && university.employmentRate > 0.9) {
        reasons.push({ text: `${Math.round(university.employmentRate * 100)}% employment rate`, type: 'success' });
      }
      reasons.push({ text: 'Top alumni network in your field', type: 'success' });
      reasons.push({ text: 'Strong internship programs', type: 'success' });
    } else if (score >= 60) {
      reasons.push({ text: 'Good career support services', type: 'success' });
    }
  }
  
  return reasons;
};

/**
 * MatchBreakdownPanel Component
 * Detailed visualization of match score breakdown by category
 * Shows scores, contributions, and specific reasons
 */
export default function MatchBreakdownPanel({ result, isExpanded = true }: MatchBreakdownPanelProps) {
  if (!isExpanded) return null;

  const categories = Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>;

  return (
    <div className="space-y-3 p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
        <h4 className="text-sm font-bold text-foreground">Why This Matches You</h4>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const config = CATEGORY_CONFIG[category];
          const Icon = config.icon;
          const breakdown = result.scoreBreakdown[category];
          const score = breakdown.score;
          const contribution = breakdown.contribution;
          const reasons = getReasons(category, score, result.university);

          return (
            <div key={category} className="space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'p-1 rounded-md',
                    config.color === 'violet' && 'bg-violet-100 dark:bg-violet-900/30',
                    config.color === 'emerald' && 'bg-emerald-100 dark:bg-emerald-900/30',
                    config.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30',
                    config.color === 'pink' && 'bg-pink-100 dark:bg-pink-900/30',
                    config.color === 'amber' && 'bg-amber-100 dark:bg-amber-900/30'
                  )}>
                    <Icon className={cn(
                      'h-3.5 w-3.5',
                      config.color === 'violet' && 'text-violet-600 dark:text-violet-400',
                      config.color === 'emerald' && 'text-emerald-600 dark:text-emerald-400',
                      config.color === 'blue' && 'text-blue-600 dark:text-blue-400',
                      config.color === 'pink' && 'text-pink-600 dark:text-pink-400',
                      config.color === 'amber' && 'text-amber-600 dark:text-amber-400'
                    )} />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{config.label}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={cn('text-xs font-bold', getScoreColor(score))}>
                    {score}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {contribution.toFixed(1)} pts
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full bg-gradient-to-r transition-all duration-500',
                    getBarColor(score)
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>

              {/* Reasons */}
              {reasons.length > 0 && (
                <div className="space-y-1 ml-7">
                  {reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      {reason.type === 'success' ? (
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      )}
                      <span className={cn(
                        'text-xs leading-relaxed',
                        reason.type === 'success' 
                          ? 'text-foreground/80' 
                          : 'text-amber-700 dark:text-amber-300'
                      )}>
                        {reason.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Summary */}
      <div className="pt-3 mt-2 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">Overall Match</span>
          <span className={cn('text-lg font-bold', getScoreColor(result.matchPercentage))}>
            {result.matchPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}
