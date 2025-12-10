import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatIfSimulatorProps {
  currentStats: {
    gpa?: number;
    satScore?: number;
    budget?: number;
  };
  onSimulate?: (newStats: { gpa?: number; satScore?: number; budget?: number }) => void;
}

/**
 * WhatIfSimulator Component
 * Interactive tool to explore how changing stats affects match scores
 * Helps users understand what improvements would have the biggest impact
 */
export default function WhatIfSimulator({ currentStats, onSimulate }: WhatIfSimulatorProps) {
  const [simulatedGPA, setSimulatedGPA] = useState(currentStats.gpa || 3.0);
  const [simulatedSAT, setSimulatedSAT] = useState(currentStats.satScore || 1200);
  const [simulatedBudget, setSimulatedBudget] = useState(currentStats.budget || 30000);

  const gpaChange = currentStats.gpa ? simulatedGPA - currentStats.gpa : 0;
  const satChange = currentStats.satScore ? simulatedSAT - currentStats.satScore : 0;
  const budgetChange = currentStats.budget ? simulatedBudget - currentStats.budget : 0;

  const handleReset = () => {
    setSimulatedGPA(currentStats.gpa || 3.0);
    setSimulatedSAT(currentStats.satScore || 1200);
    setSimulatedBudget(currentStats.budget || 30000);
  };

  const handleSimulate = () => {
    onSimulate?.({
      gpa: simulatedGPA,
      satScore: simulatedSAT,
      budget: simulatedBudget,
    });
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getChangeBadge = (change: number, formatter: (val: number) => string) => {
    if (Math.abs(change) < 0.01) return null;
    
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'text-xs font-medium',
          change > 0 && 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400',
          change < 0 && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400'
        )}
      >
        <span className="flex items-center gap-1">
          {getChangeIcon(change)}
          {formatter(Math.abs(change))}
        </span>
      </Badge>
    );
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
              What-If Simulator
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Adjust your stats to see how they affect your matches
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            className="h-7 px-2"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GPA Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sim-gpa" className="text-xs font-medium">GPA</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{simulatedGPA.toFixed(2)}</span>
              {getChangeBadge(gpaChange, (val) => val.toFixed(2))}
            </div>
          </div>
          <Slider
            id="sim-gpa"
            min={0}
            max={4.0}
            step={0.1}
            value={[simulatedGPA]}
            onValueChange={([value]) => setSimulatedGPA(value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.0</span>
            <span>4.0</span>
          </div>
        </div>

        {/* SAT Score Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sim-sat" className="text-xs font-medium">SAT Score</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{Math.round(simulatedSAT)}</span>
              {getChangeBadge(satChange, (val) => Math.round(val).toString())}
            </div>
          </div>
          <Slider
            id="sim-sat"
            min={400}
            max={1600}
            step={10}
            value={[simulatedSAT]}
            onValueChange={([value]) => setSimulatedSAT(value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>400</span>
            <span>1600</span>
          </div>
        </div>

        {/* Budget Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sim-budget" className="text-xs font-medium">Annual Budget</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">${(simulatedBudget / 1000).toFixed(0)}k</span>
              {getChangeBadge(budgetChange, (val) => `$${(val / 1000).toFixed(0)}k`)}
            </div>
          </div>
          <Slider
            id="sim-budget"
            min={0}
            max={80000}
            step={1000}
            value={[simulatedBudget]}
            onValueChange={([value]) => setSimulatedBudget(value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>$80k</span>
          </div>
        </div>

        {/* Apply Button */}
        <Button 
          onClick={handleSimulate} 
          className="w-full"
          size="sm"
          disabled={gpaChange === 0 && satChange === 0 && budgetChange === 0}
        >
          Apply Simulated Stats
        </Button>

        {/* Impact Summary */}
        {(Math.abs(gpaChange) > 0.01 || Math.abs(satChange) > 0.01 || Math.abs(budgetChange) > 0.01) && (
          <div className="p-3 bg-muted/30 rounded-lg border border-border">
            <p className="text-xs font-medium mb-2">Projected Impact:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {Math.abs(gpaChange) > 0.01 && (
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5">•</span>
                  <span>
                    {gpaChange > 0 ? 'Improving' : 'Lowering'} GPA by {Math.abs(gpaChange).toFixed(2)} could 
                    {gpaChange > 0 ? ' unlock more competitive schools' : ' limit reach school options'}
                  </span>
                </li>
              )}
              {Math.abs(satChange) > 10 && (
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5">•</span>
                  <span>
                    {satChange > 0 ? 'Raising' : 'Lowering'} SAT by {Math.abs(satChange)} points may 
                    {satChange > 0 ? ' improve academic match scores' : ' reduce academic competitiveness'}
                  </span>
                </li>
              )}
              {Math.abs(budgetChange) > 1000 && (
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5">•</span>
                  <span>
                    {budgetChange > 0 ? 'Increasing' : 'Decreasing'} budget by ${(Math.abs(budgetChange) / 1000).toFixed(0)}k 
                    {budgetChange > 0 ? ' expands your options' : ' narrows financial fit matches'}
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
