import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, DollarSign, MapPin, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UniversityMatchResult } from '@/hooks/useUniversitySearch';

interface RecommendationsPanelProps {
  results: UniversityMatchResult[];
  userProfile?: {
    gpa?: number;
    satScore?: number;
    budget?: number;
    preferredMajor?: string;
  };
}

interface Recommendation {
  type: 'academic' | 'financial' | 'location' | 'social' | 'future';
  priority: 'high' | 'medium' | 'low';
  icon: typeof TrendingUp;
  title: string;
  message: string;
  impact: string;
}

/**
 * RecommendationsPanel Component
 * Analyzes search results and user profile to generate actionable recommendations
 * Helps users understand how to improve their match scores and expand options
 */
export default function RecommendationsPanel({ results, userProfile }: RecommendationsPanelProps) {
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    if (!results || results.length === 0 || !userProfile) {
      return recommendations;
    }

    // Calculate average scores across all results
    const avgAcademic = results.reduce((sum, r) => sum + r.scoreBreakdown.academic.score, 0) / results.length;
    const avgFinancial = results.reduce((sum, r) => sum + r.scoreBreakdown.financial.score, 0) / results.length;
    
    // Find universities above user's budget
    const expensiveSchools = results.filter(r => {
      const tuition = r.university.tuitionOutState || 0;
      return userProfile.budget && tuition > userProfile.budget;
    }).length;

    // Find high-match schools (80%+)
    const excellentMatches = results.filter(r => r.matchPercentage >= 80).length;
    const goodMatches = results.filter(r => r.matchPercentage >= 60 && r.matchPercentage < 80).length;
    
    // Academic Recommendations
    if (avgAcademic < 70 && userProfile.gpa && userProfile.gpa < 3.5) {
      const targetGPA = Math.min(4.0, (userProfile.gpa || 3.0) + 0.3);
      recommendations.push({
        type: 'academic',
        priority: 'high',
        icon: GraduationCap,
        title: 'Improve Academic Profile',
        message: `Raising your GPA to ${targetGPA.toFixed(1)} could significantly improve your academic match scores`,
        impact: `Could unlock ${Math.floor(results.length * 0.2)} more competitive schools`,
      });
    }

    if (avgAcademic < 70 && userProfile.satScore && userProfile.satScore < 1300) {
      const targetSAT = Math.min(1600, (userProfile.satScore || 1200) + 100);
      recommendations.push({
        type: 'academic',
        priority: 'high',
        icon: TrendingUp,
        title: 'Consider SAT Prep',
        message: `Improving your SAT to ${targetSAT} would strengthen applications to reach schools`,
        impact: `Estimated 10-15% increase in academic match scores`,
      });
    }

    // Financial Recommendations
    if (expensiveSchools > results.length * 0.3) {
      recommendations.push({
        type: 'financial',
        priority: 'medium',
        icon: DollarSign,
        title: 'Expand Budget Range',
        message: `${expensiveSchools} schools exceed your budget - consider increasing by $5k to see more matches`,
        impact: `Could reveal ${Math.floor(expensiveSchools * 0.6)} affordable options with aid`,
      });
    }

    if (avgFinancial < 60 && userProfile.budget && userProfile.budget < 40000) {
      recommendations.push({
        type: 'financial',
        priority: 'high',
        icon: DollarSign,
        title: 'Explore Financial Aid',
        message: `Many schools offer substantial aid packages - consider schools with strong endowments`,
        impact: `Average grant aid could reduce costs by $15k-$25k annually`,
      });
    }

    // Match Quality Recommendations
    if (excellentMatches < 3) {
      recommendations.push({
        type: 'academic',
        priority: 'high',
        icon: TrendingUp,
        title: 'Add Safety Schools',
        message: `You have only ${excellentMatches} excellent matches - consider broadening search criteria`,
        impact: `Recommended: 3-5 safety schools (80%+ match)`,
      });
    }

    if (goodMatches < 5 && results.length > 10) {
      recommendations.push({
        type: 'social',
        priority: 'medium',
        icon: MapPin,
        title: 'Broaden Location Preferences',
        message: `Expanding geographic preferences could reveal ${Math.floor(results.length * 0.3)} more good-fit schools`,
        impact: `Consider neighboring states or different regions`,
      });
    }

    // Test-Optional Opportunity
    if (userProfile.satScore && userProfile.satScore < 1200) {
      // testPolicy field doesn't exist in current schema, so skip this check
      const testOptionalCount = 0;
      
      if (testOptionalCount > 0) {
        recommendations.push({
          type: 'academic',
          priority: 'medium',
          icon: GraduationCap,
          title: 'Leverage Test-Optional Policies',
          message: `${testOptionalCount} schools have test-optional policies - emphasize your GPA and other strengths`,
          impact: `Could improve admissions chances by focusing on non-test metrics`,
        });
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 4);
  };

  const recommendations = generateRecommendations();

  if (recommendations.length === 0) {
    return null;
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900';
    }
  };

  return (
    <Card className="border-border bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          Personalized Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, idx) => {
          const Icon = rec.icon;
          return (
            <div 
              key={idx} 
              className="p-3 bg-background rounded-lg border border-border hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', getPriorityColor(rec.priority))}
                    >
                      {rec.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rec.message}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {rec.impact}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
