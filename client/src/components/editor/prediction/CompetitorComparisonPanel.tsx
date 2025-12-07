/* @ts-nocheck */
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateMockCompetitors } from '@/lib/competitorComparisonService'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { PredictionResult } from '@shared/types/articleForecaster'

interface CompetitorComparisonPanelProps {
  prediction: PredictionResult | null
  articleKeyword?: string
}

export function CompetitorComparisonPanel({ prediction, articleKeyword = 'your topic' }: CompetitorComparisonPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customKeyword, setCustomKeyword] = useState(articleKeyword)

  if (!prediction || !prediction.features) return null

  const comparison = generateMockCompetitors(customKeyword, prediction.features)

  const wordCountDiff = comparison.yourStats.wordCount - comparison.averageStats.wordCount
  const imagesDiff = comparison.yourStats.images - comparison.averageStats.images
  // const headingsDiff = comparison.yourStats.headings - comparison.averageStats.headings

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-[var(--primary)] mb-3">Competitor Comparison</h3>
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            value={customKeyword}
            onChange={(e) => setCustomKeyword(e.target.value)}
            placeholder="Enter keyword to analyze..."
            className="flex-1 h-8 text-sm"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 'Hide' : 'Show'}
          </Button>
        </div>

        {isOpen && (
          <div className="space-y-4 mt-4 border-t pt-4">
            {/* Your Stats vs Average */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Your Article</span>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Word Count:</span>
                    <span className="font-semibold">{comparison.yourStats.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Headings:</span>
                    <span className="font-semibold">{comparison.yourStats.headings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images:</span>
                    <span className="font-semibold">{comparison.yourStats.images}</span>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Top 3 Average</span>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Word Count:</span>
                    <span className="font-semibold">{comparison.averageStats.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Headings:</span>
                    <span className="font-semibold">{comparison.averageStats.headings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images:</span>
                    <span className="font-semibold">{comparison.averageStats.images}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Comparison */}
            <div className="bg-muted/50 p-3 rounded space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span>Word Count Gap:</span>
                <div className="flex items-center gap-1">
                  {wordCountDiff >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <span className={wordCountDiff >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {wordCountDiff > 0 ? '+' : ''}{wordCountDiff}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Images Gap:</span>
                <div className="flex items-center gap-1">
                  {imagesDiff >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <span className={imagesDiff >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {imagesDiff > 0 ? '+' : ''}{imagesDiff}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {comparison.recommendations.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded">
                <span className="text-xs font-semibold text-blue-900 dark:text-blue-200 block mb-2">Competitor Insights:</span>
                <ul className="text-xs space-y-1 text-blue-800 dark:text-blue-300">
                  {comparison.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Competitors Table */}
            <div className="text-xs">
              <span className="text-muted-foreground block mb-2">Top Ranking Articles</span>
              <div className="space-y-2">
                {comparison.competitors.map((comp) => (
                  <div key={comp.rank} className="border rounded p-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-[var(--primary)]">#{comp.rank}</span>
                      <span className="text-muted-foreground text-xs">{comp.url}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{comp.title}</div>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{comp.wordCount} words</span>
                      <span>{comp.headings} headings</span>
                      <span>{comp.images} images</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default CompetitorComparisonPanel
