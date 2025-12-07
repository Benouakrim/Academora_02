import { useState } from 'react'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useArticlePrediction } from '@/hooks/useArticlePrediction'
import { ScoreMeter } from './ScoreMeter'
import { RecommendationsList } from './RecommendationsList'
import { generateCSVReport, generateJSONReport, downloadReport } from '@/lib/exportReportService'
import { Download, Download2 } from 'lucide-react'
/* @ts-nocheck */

import type { PredictRequest, PredictionResult } from '../../../shared/types/articleForecaster'

interface PerformancePanelProps {
  prediction?: PredictionResult | null
  predictionHistory?: PredictionResult[]
  onAnalyze?: () => void
}

// Simple sparkline component
function Sparkline({ data }: { data: number[] }) {
  if (!data.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const points = data.map((v, i) => `${i * 20},${40 - ((v - min) / (max - min || 1)) * 40}`).join(' ')
  return (
    <svg width={data.length * 20} height={40} style={{ display: 'block' }}>
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        points={points}
      />
    </svg>
  )
}

export function PerformancePanel({ prediction: externalPrediction, predictionHistory = [], onAnalyze }: PerformancePanelProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const mutation = useArticlePrediction()
  const prediction = externalPrediction || (mutation.data ?? null)

  // Extract SEO score history for sparkline
  const seoScores = predictionHistory.map(p => p.seoScore || 0)

  const handleExportCSV = () => {
    if (!prediction) return
    const csv = generateCSVReport(prediction, 'Article Performance Report')
    downloadReport(csv, `performance-report-${Date.now()}.csv`)
  }

  const handleExportJSON = () => {
    if (!prediction) return
    const json = generateJSONReport(prediction, 'Article Performance Report')
    downloadReport(json, `performance-report-${Date.now()}.json`)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          4ca Performance
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md">
        <div className="space-y-6 mt-8">
          <h2 className="text-xl font-bold text-[var(--primary)]">Article Performance Forecaster</h2>

          {seoScores.length > 1 && (
            <div className="mb-4">
              <span className="font-semibold text-[var(--primary)] block mb-2">SEO Score History:</span>
              <Sparkline data={seoScores} />
            </div>
          )}

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
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleExportCSV}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" /> CSV
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleExportJSON}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" /> JSON
                </Button>
              </div>
              <div className="border-t pt-4">
                <span className="font-semibold text-[var(--primary)] block mb-2">SEO Score:</span>
                <ScoreMeter score={prediction.seoScore || 0} />
              </div>
              <div className="border-t pt-4">
                <span className="font-semibold text-[var(--primary)] block mb-2">Monthly Traffic:</span>
                <div className="flex flex-col gap-2 text-sm">
                  <span className="bg-[var(--muted)] px-2 py-1 rounded">Low: {prediction.trafficForecast?.low || 0}</span>
                  <span className="bg-[var(--muted)] px-2 py-1 rounded">Med: {prediction.trafficForecast?.med || 0}</span>
                  <span className="bg-[var(--muted)] px-2 py-1 rounded">High: {prediction.trafficForecast?.high || 0}</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <span className="font-semibold text-[var(--primary)] block mb-2">Estimated Ad Revenue:</span>
                <span className="text-green-600 font-bold">${(prediction.adRevenue || 0).toFixed(2)}</span>
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
