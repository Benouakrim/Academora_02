import { Target, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '@/store/useSearchStore';

/**
 * MatchModeEmptyState Component
 * Shown when user tries to use Match mode without a complete profile
 * Encourages profile completion with checklist and CTA
 */
export default function MatchModeEmptyState() {
  const navigate = useNavigate();
  const { setViewMode, criteria } = useSearchStore();

  const profileCompleteness = {
    academics: !!(criteria.userProfile?.gpa || criteria.userProfile?.satScore || criteria.userProfile?.actScore),
    major: !!criteria.userProfile?.preferredMajor,
    financial: !!criteria.userProfile?.maxBudget,
    location: !!(criteria.location?.countries?.length || criteria.location?.states?.length),
  };

  const completedCount = Object.values(profileCompleteness).filter(Boolean).length;
  const totalCount = Object.keys(profileCompleteness).length;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-2xl mx-auto">
      {/* Icon */}
      <div className="relative mb-8">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
          <Target className="h-12 w-12 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
          <span className="text-white text-sm font-bold">{completedCount}/{totalCount}</span>
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-bold text-foreground mb-3">
        Unlock Your Best Matches
      </h2>
      
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        Complete your profile to see personalized university recommendations 
        based on your academic goals and preferences
      </p>

      {/* Checklist */}
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-border rounded-xl p-6 mb-8 text-left">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground">
            Takes about 5 minutes
          </span>
        </div>

        <div className="space-y-3">
          <ChecklistItem
            completed={profileCompleteness.academics}
            label="Academic Profile"
            description="GPA, test scores, and academic achievements"
          />
          <ChecklistItem
            completed={profileCompleteness.major}
            label="Major Preferences"
            description="Your intended field of study"
          />
          <ChecklistItem
            completed={profileCompleteness.financial}
            label="Budget & Financial Info"
            description="Affordability and financial aid needs"
          />
          <ChecklistItem
            completed={profileCompleteness.location}
            label="Location Preferences"
            description="Where you'd like to study"
          />
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <Button
          size="lg"
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
          onClick={() => navigate('/onboarding')}
        >
          Complete Profile Now
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={() => setViewMode('BROWSE')}
        >
          Browse All Schools Instead
        </Button>
      </div>

      {/* Additional Help */}
      <p className="text-xs text-muted-foreground mt-6">
        Your information is private and secure. We use it only to provide better recommendations.
      </p>
    </div>
  );
}

function ChecklistItem({ 
  completed, 
  label, 
  description 
}: { 
  completed: boolean; 
  label: string; 
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        {completed ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground/40" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-semibold',
            completed ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {label}
          </span>
          {completed && (
            <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
              Complete
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

// Import cn utility
import { cn } from '@/lib/utils';
