// client/src/components/smart-blocks/UserFitMeterDisplay.tsx
import React from 'react';
import { Target, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { UserFitMeterBlock } from '@/../../shared/types/microContentBlocks';

interface UserFitMeterDisplayProps {
  block: UserFitMeterBlock; // The micro-content configuration
  universityProfile: Record<string, string | number | boolean | null | undefined>; // University scalar data (e.g., avgGpa)
  userProfile: Record<string, string | number | boolean | null | undefined>; // User's profile data (e.g., gpa)
}

/**
 * UserFitMeterDisplay: INVERSE BLOCK Component
 * 
 * This is an "inverse" block because it consumes canonical data from the University
 * combined with user-specific data to provide personalized, dynamic content.
 * 
 * Example: "Your GPA (3.8) is strong compared to the average (3.5)"
 * 
 * Features:
 * - Personalizes comparison based on user data
 * - Shows visual progress indicator
 * - Provides actionable next steps
 * - Gracefully handles missing data
 */
export default function UserFitMeterDisplay({
  block,
  universityProfile,
  userProfile,
}: UserFitMeterDisplayProps) {
  const {
    metricToCompare,
    canonicalValueField,
    canonicalValueLabel,
    userValueField,
    showComparisonText,
    showNextStepsCta,
  } = block.data;

  const blockTitle = block.title || `Your ${metricToCompare.toUpperCase()} Fit`;

  // Extract values from profiles and ensure they're numbers
  const canonicalValue = universityProfile?.[canonicalValueField];
  const userValue = userProfile?.[userValueField];
  
  // Type guard: Check if values are actually numbers
  const isCanonicalNumber = typeof canonicalValue === 'number';
  const isUserNumber = typeof userValue === 'number';

  const isDataMissing =
    !isCanonicalNumber ||
    !isUserNumber;

  // ============================================
  // CORE LOGIC: Personalized Comparison
  // ============================================

  let statusText = 'Profile incomplete. Update your academic profile to see your fit.';
  let statusDescription = '';
  let progressValue = 0;
  let isGoodFit = false;
  let trendIcon = null;

  if (!isDataMissing) {
    if (metricToCompare === 'gpa') {
      // GPA Comparison Logic
      const canonicalGpa = canonicalValue as number;
      const userGpa = userValue as number;
      const maxGpa = 4.0;
      const diff = userGpa - canonicalGpa;
      const tolerance = 0.2; // User within 0.2 GPA is considered "good fit"

      // Progress bar based on user's GPA (0-4.0 scale)
      progressValue = Math.min(100, Math.max(0, (userGpa / maxGpa) * 100));

      isGoodFit = diff >= -tolerance;

      if (isGoodFit) {
        if (diff >= 0) {
          statusText = `Your GPA (${userGpa.toFixed(2)}) exceeds the average!`;
          statusDescription = `You're ${(Math.abs(diff)).toFixed(2)} points above the ${canonicalValueLabel} (${canonicalGpa.toFixed(2)}).`;
          trendIcon = <TrendingUp className="h-5 w-5 text-green-500" />;
        } else {
          statusText = `Your GPA (${userGpa.toFixed(2)}) is competitive.`;
          statusDescription = `You're only ${(Math.abs(diff)).toFixed(2)} points below the ${canonicalValueLabel} (${canonicalGpa.toFixed(2)}).`;
          trendIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
        }
      } else {
        statusText = `Your GPA (${userGpa.toFixed(2)}) is below the average.`;
        statusDescription = `The ${canonicalValueLabel} is ${(Math.abs(diff)).toFixed(2)} points higher (${canonicalGpa.toFixed(2)}).`;
        trendIcon = <TrendingDown className="h-5 w-5 text-yellow-500" />;
      }
    } else if (metricToCompare === 'sat') {
      // SAT Comparison Logic
      const canonicalSat = canonicalValue as number;
      const userSat = userValue as number;
      const maxSat = 1600;
      const diff = userSat - canonicalSat;
      const tolerance = 50; // Within 50 points is considered "good fit"

      progressValue = Math.min(100, Math.max(0, (userSat / maxSat) * 100));

      isGoodFit = diff >= -tolerance;

      if (isGoodFit) {
        if (diff >= 0) {
          statusText = `Your SAT score (${userSat}) exceeds the average!`;
          statusDescription = `You're ${Math.abs(diff)} points above the ${canonicalValueLabel} (${canonicalSat}).`;
          trendIcon = <TrendingUp className="h-5 w-5 text-green-500" />;
        } else {
          statusText = `Your SAT score (${userSat}) is competitive.`;
          statusDescription = `You're only ${Math.abs(diff)} points below the ${canonicalValueLabel} (${canonicalSat}).`;
          trendIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
        }
      } else {
        statusText = `Your SAT score (${userSat}) is below the average.`;
        statusDescription = `The ${canonicalValueLabel} is ${Math.abs(diff)} points higher (${canonicalSat}).`;
        trendIcon = <TrendingDown className="h-5 w-5 text-yellow-500" />;
      }
    } else if (metricToCompare === 'act') {
      // ACT Comparison Logic
      const canonicalAct = canonicalValue as number;
      const userAct = userValue as number;
      const maxAct = 36;
      const diff = userAct - canonicalAct;
      const tolerance = 2; // Within 2 points is considered "good fit"

      progressValue = Math.min(100, Math.max(0, (userAct / maxAct) * 100));

      isGoodFit = diff >= -tolerance;

      if (isGoodFit) {
        if (diff >= 0) {
          statusText = `Your ACT score (${userAct}) exceeds the average!`;
          statusDescription = `You're ${Math.abs(diff)} points above the ${canonicalValueLabel} (${canonicalAct}).`;
          trendIcon = <TrendingUp className="h-5 w-5 text-green-500" />;
        } else {
          statusText = `Your ACT score (${userAct}) is competitive.`;
          statusDescription = `You're only ${Math.abs(diff)} points below the ${canonicalValueLabel} (${canonicalAct}).`;
          trendIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
        }
      } else {
        statusText = `Your ACT score (${userAct}) is below the average.`;
        statusDescription = `The ${canonicalValueLabel} is ${Math.abs(diff)} points higher (${canonicalAct}).`;
        trendIcon = <TrendingDown className="h-5 w-5 text-yellow-500" />;
      }
    } else if (metricToCompare === 'tuition') {
      // Tuition Comparison Logic (Financial Health Comparison)
      // canonicalValue = University tuition/cost (e.g., tuitionOutState)
      // userValue = User's maxBudget from financial profile
      const cost = canonicalValue as number;
      const budget = userValue as number;
      
      // Progress: Percentage of budget used by the cost (capped at 100%)
      progressValue = Math.min(100, Math.round((cost / budget) * 100));
      
      // Good fit: Cost is within or below budget
      isGoodFit = cost <= budget;
      
      if (isGoodFit) {
        const remainingBudget = budget - cost;
        statusText = `Cost is within your budget!`;
        statusDescription = `${canonicalValueLabel} ($${cost.toLocaleString()}) is within your budget ($${budget.toLocaleString()}). You have $${remainingBudget.toLocaleString()} remaining for other expenses.`;
        trendIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
      } else {
        const gap = cost - budget;
        statusText = `Cost exceeds your budget.`;
        statusDescription = `${canonicalValueLabel} ($${cost.toLocaleString()}) exceeds your budget ($${budget.toLocaleString()}) by $${gap.toLocaleString()}. Explore financial aid and scholarships to bridge the gap.`;
        trendIcon = <TrendingUp className="h-5 w-5 text-yellow-500" />;
      }
    }
  }

  // ============================================
  // RENDER: Missing Data State
  // ============================================

  if (isDataMissing) {
    return (
      <Card className="border-dashed border-gray-300 bg-gray-50 border-2">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Target className="h-6 w-6 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">{blockTitle}</h4>
              <p className="text-sm text-gray-500">{statusText}</p>
              <Button variant="outline" size="sm" className="mt-3">
                Complete Your Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================
  // RENDER: With Data
  // ============================================

  return (
    <Card className={`shadow-lg border-2 transition-colors ${
      isGoodFit 
        ? 'border-green-200 bg-gradient-to-br from-green-50 to-white' 
        : 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white'
    }`}>
      <CardContent className="p-6 space-y-4">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">{blockTitle}</h4>
          </div>
          {isGoodFit ? (
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Your Performance</span>
            <span className="text-xs font-semibold text-gray-700">{progressValue}%</span>
          </div>
          <Progress
            value={progressValue}
            className="h-2.5"
            // Note: Progress component should accept indicatorClassName
            style={{
              background: '#e5e7eb',
            } as React.CSSProperties}
          />
        </div>

        {/* Status Section */}
        {showComparisonText && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {trendIcon}
              <p className="text-sm font-semibold text-gray-800">{statusText}</p>
            </div>
            {statusDescription && (
              <p className="text-sm text-gray-600 ml-7">{statusDescription}</p>
            )}
          </div>
        )}

        {/* CTA Section */}
        {showNextStepsCta && (
          <div className="pt-2">
            <Button
              className={isGoodFit ? 'w-full' : 'w-full'}
              variant={isGoodFit ? 'default' : 'secondary'}
              size="sm"
            >
              {isGoodFit ? '✨ Explore Next Steps' : '📈 Tips for Improvement'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
