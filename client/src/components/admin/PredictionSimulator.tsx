// client/src/components/admin/PredictionSimulator.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap } from 'lucide-react';
import { simulateMatchScore } from '@/api/predictionApi';
import { useToast } from '@/hooks/use-toast';

interface PredictionSimulatorProps {
  currentData: Record<string, unknown>;
  userId: string;
  universityId: string;
}

/**
 * PredictionSimulator: Non-persisting "What-If" analysis component
 * 
 * This component uses transient state (temporary user-provided values)
 * to call a backend service that calculates match scores WITHOUT saving
 * to the database. This enables users to explore scenarios safely.
 * 
 * Scenario 2: Transient Simulation (Non-Persisting Prediction)
 */
export default function PredictionSimulator({ 
  currentData, 
  userId, 
  universityId 
}: PredictionSimulatorProps) {
  const [predictionResult, setPredictionResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePredict = async () => {
    setIsLoading(true);
    setPredictionResult(null);
    setError(null);

    try {
      // SCENARIO 2 IMPLEMENTATION: Call non-persisting API with transient data
      // The backend will use currentData instead of fetching from database
      const result = await simulateMatchScore({
        userId,
        universityId,
        universityData: currentData,
      });

      setPredictionResult(result.matchScore);
      toast({
        title: 'Prediction Complete',
        description: `Match score calculated: ${result.matchScore.toFixed(2)}%`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Prediction failed';
      setError(message);
      console.error('Prediction failed:', err);
      toast({
        title: 'Prediction Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-blue-300 bg-blue-50/50 mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-blue-600" />
          What-If Simulator (Scenario 2)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Use the values above to test how changes would affect a student's match score without saving to the database.
          Your edits remain temporary and are cleared when you leave this page.
        </p>

        <div className="flex gap-2">
          <Button 
            onClick={handlePredict} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {isLoading ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Predict Student Match Score
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 border border-red-300 bg-red-50 rounded text-sm text-red-800">
            ⚠️ {error}
          </div>
        )}

        {predictionResult !== null && (
          <div className="p-4 border border-green-300 bg-green-50 rounded">
            <div className="text-sm text-gray-600 mb-1">Predicted Match Score</div>
            <div className="text-3xl font-bold text-green-700">
              {predictionResult.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 mt-2">
              This prediction is based on the current form values and was not saved to the database.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
