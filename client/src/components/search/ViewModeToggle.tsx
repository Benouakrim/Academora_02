import { Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchStore } from '@/store/useSearchStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * ViewModeToggle Component
 * Allows users to switch between Browse and Best Matches modes
 * with smooth animations and visual feedback
 */
export default function ViewModeToggle() {
  const { viewMode, setViewMode, hasCompleteProfile } = useSearchStore();
  const isProfileComplete = hasCompleteProfile();

  const handleModeChange = (mode: 'BROWSE' | 'MATCH') => {
    // If switching to MATCH mode without profile, show tooltip/warning
    if (mode === 'MATCH' && !isProfileComplete) {
      // The component will show disabled state, tooltip explains why
      return;
    }
    setViewMode(mode);
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/50">
      {/* Browse Mode Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={() => handleModeChange('BROWSE')}
            className={cn(
              'relative px-3 sm:px-4 py-2 rounded-md transition-all duration-300 flex items-center gap-2 text-sm font-medium',
              viewMode === 'BROWSE'
                ? 'text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {viewMode === 'BROWSE' && (
              <motion.div
                layoutId="activeMode"
                className="absolute inset-0 bg-background border border-border/80 rounded-md"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
            <Search className="h-4 w-4 relative z-10" />
            <span className="hidden sm:inline relative z-10">Browse</span>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Browse all universities with filters</p>
        </TooltipContent>
      </Tooltip>

      {/* Best Matches Mode Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={() => handleModeChange('MATCH')}
            disabled={!isProfileComplete}
            className={cn(
              'relative px-3 sm:px-4 py-2 rounded-md transition-all duration-300 flex items-center gap-2 text-sm font-medium',
              viewMode === 'MATCH'
                ? 'text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              !isProfileComplete && 'opacity-50 cursor-not-allowed'
            )}
            whileHover={isProfileComplete ? { scale: 1.02 } : {}}
            whileTap={isProfileComplete ? { scale: 0.98 } : {}}
          >
            {viewMode === 'MATCH' && (
              <motion.div
                layoutId="activeMode"
                className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_100%] rounded-md animate-gradient"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
            <Sparkles className="h-4 w-4 relative z-10" />
            <span className="hidden sm:inline relative z-10">Best Matches</span>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>
          {isProfileComplete ? (
            <p>Find your personalized best matches</p>
          ) : (
            <div className="space-y-1">
              <p className="font-semibold">Complete your profile to unlock</p>
              <p className="text-xs text-muted-foreground">
                Add academic info and preferences for personalized matches
              </p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
