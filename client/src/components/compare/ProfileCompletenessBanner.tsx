import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ProfileCompletenessBannerProps {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}

export function ProfileCompletenessBanner({
  isComplete,
  completionPercentage,
  missingFields,
}: ProfileCompletenessBannerProps) {
  if (isComplete) {
    return (
      <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900 dark:text-green-100">
          Profile Complete
        </AlertTitle>
        <AlertDescription className="text-green-800 dark:text-green-200">
          Your profile is complete! You'll see personalized financial aid predictions below.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
        Complete Your Profile for Personalized Predictions
        <XCircle className="h-4 w-4" />
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-amber-800 dark:text-amber-200">
          To see personalized financial aid estimates and net costs, please complete your profile.
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-amber-700 dark:text-amber-300">Profile Completion</span>
            <span className="font-semibold text-amber-900 dark:text-amber-100">
              {completionPercentage}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {missingFields.length > 0 && (
          <div className="text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
              Missing information:
            </p>
            <ul className="list-disc list-inside text-amber-800 dark:text-amber-200 space-y-0.5">
              {missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Link to="/dashboard/profile?tab=academic">
            <Button size="sm" variant="default">
              Complete Profile
            </Button>
          </Link>
          <Link to="/dashboard/profile?tab=financial">
            <Button size="sm" variant="outline">
              Add Financial Info
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}
