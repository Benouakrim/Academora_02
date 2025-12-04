import { DollarSign, TrendingDown, TrendingUp, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { FinancialPrediction } from '@/hooks/useCompare';
import type { UniversityDetail } from '@/hooks/useUniversityDetail';

interface FinancialPredictionsProps {
  universities: UniversityDetail[];
  predictions: Record<string, FinancialPrediction | null>;
}

export function FinancialPredictions({ universities, predictions }: FinancialPredictionsProps) {
  const validPredictions = universities
    .map(u => ({
      university: u,
      prediction: predictions[u.id],
    }))
    .filter(item => item.prediction && !item.prediction.eligibilityWarning);

  if (validPredictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Aid Predictions
          </CardTitle>
          <CardDescription>
            No predictions available. Complete your profile to see personalized estimates.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate average net price for comparison
  const averageNetPrice = validPredictions.reduce(
    (sum, item) => sum + item.prediction!.netPrice,
    0
  ) / validPredictions.length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">💰 Personalized Cost Estimates</h3>
        <p className="text-sm text-muted-foreground">
          Based on your financial and academic profile
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {validPredictions.map(({ university, prediction }) => {
          const isAffordable = prediction!.netPrice < averageNetPrice;
          const savingsVsAverage = averageNetPrice - prediction!.netPrice;

          return (
            <Card key={university.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-1">
                      {university.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {university.city}, {university.country}
                    </CardDescription>
                  </div>
                  {isAffordable && (
                    <Badge variant="default" className="bg-green-600 text-xs">
                      Best Deal
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Net Price - Most Important */}
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 mb-1 cursor-help">
                          <span className="text-sm font-medium text-muted-foreground">
                            Estimated Net Cost
                          </span>
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>What you'll actually pay after financial aid</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      ${prediction!.netPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">/year</span>
                  </div>
                  {savingsVsAverage !== 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {isAffordable ? (
                        <>
                          <TrendingDown className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">
                            ${Math.abs(savingsVsAverage).toLocaleString()} below average
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-3 w-3 text-orange-600" />
                          <span className="text-xs text-orange-600 font-medium">
                            ${Math.abs(savingsVsAverage).toLocaleString()} above average
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Detailed Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Cost</span>
                    <span className="font-medium">
                      ${prediction!.grossCost.toLocaleString()}
                    </span>
                  </div>

                  {prediction!.needAid > 0 && (
                    <div className="flex justify-between text-blue-600 dark:text-blue-400">
                      <span>Need-Based Aid</span>
                      <span className="font-medium">
                        -${prediction!.needAid.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {prediction!.meritAid > 0 && (
                    <div className="flex justify-between text-purple-600 dark:text-purple-400">
                      <span>Merit Aid</span>
                      <span className="font-medium">
                        -${prediction!.meritAid.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                    <span>Total Aid</span>
                    <span>-${prediction!.totalAid.toLocaleString()}</span>
                  </div>
                </div>

                {/* Explanation */}
                {prediction!.breakdown && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                    {prediction!.breakdown}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
