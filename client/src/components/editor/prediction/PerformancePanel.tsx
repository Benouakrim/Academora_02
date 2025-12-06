import { useState } from 'react'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useArticlePrediction } from '@/hooks/useArticlePrediction'
import { ScoreMeter } from './ScoreMeter'
import { RecommendationsList } from './RecommendationsList'
/* @ts-nocheck */
import type { PredictRequest, PredictionResult } from '../../../shared/types/articleForecaster'

interface PerformancePanelProps {
  prediction?: PredictionResult | null
  onAnalyze?: () => void
}

export function PerformancePanel({ prediction: externalPrediction, onAnalyze }: PerformancePanelProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const mutation = useArticlePrediction()
  const prediction = externalPrediction || (mutation.data ?? null)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          📊 Performance
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md">
        <div className="space-y-6 mt-8">
          <h2 className="text-xl font-bold text-[var(--primary)]">Article Performance Forecaster</h2>
          
          {onAnalyze ? (
            <Button 
              type="button"
              onClick={() => {
                onAnalyze()
              }}
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? 'Analyzing...' : 'Analyze Article'}
            </Button>
          ) : (
            <div className="p-3 bg-yellow-100 text-yellow-700 rounded text-sm">
              Unable to analyze article. Please ensure all required fields are filled.
            </div>
          )}

          {mutation.isError && (
            <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
              Error analyzing article. Please try again.
            </div>
          )}

          {prediction && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <span className="font-semibold text-[var(--primary)] block mb-2">SEO Score:</span>
                <ScoreMeter score={prediction.seoScore || 0} />
              </div>
              <div className="border-t pt-4">
                <span className="font-semibold text-[var(--primary)] block mb-2">Monthly Traffic:</span>
                <div className="flex flex-col gap-2 text-sm">
                  <span className="bg-[var(--muted)] px-2 py-1 rounded">Low: {prediction.trafficForecast.low}</span>
                  <span className="bg-[var(--muted)] px-2 py-1 rounded">Med: {prediction.trafficForecast.med}</span>
                  <span className="bg-[var(--muted)] px-2 py-1 rounded">High: {prediction.trafficForecast.high}</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <span className="font-semibold text-[var(--primary)] block mb-2">Estimated Ad Revenue:</span>
                <span className="text-green-600 font-bold">${prediction.adRevenue.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <span className="font-semibold text-[var(--primary)] block mb-2">Recommendations:</span>
                <RecommendationsList items={prediction.recommendations || []} />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default PerformancePanel
