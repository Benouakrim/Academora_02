/* @ts-nocheck */
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { calculateROI, type BusinessMetrics } from '@/lib/roiCalculatorService'
import { DollarSign, TrendingUp } from 'lucide-react'
import type { PredictionResult } from '@shared/types/articleForecaster'

interface ROICalculatorPanelProps {
  prediction: PredictionResult | null
}

export function ROICalculatorPanel({ prediction }: ROICalculatorPanelProps) {
  const [showCalculator, setShowCalculator] = useState(false)
  const [productPrice, setProductPrice] = useState<number>(29)
  const [conversionRate, setConversionRate] = useState<number>(0.5)
  const [marginPercentage, setMarginPercentage] = useState<number>(40)
  const [contentCreationCost, setContentCreationCost] = useState<number>(500)

  if (!prediction || !prediction.trafficForecast) return null

  const metrics: BusinessMetrics = {
    productPrice,
    conversionRate,
    marginPercentage,
  }

  const roi = calculateROI(prediction.trafficForecast, metrics, contentCreationCost)

  const getCurrencyFormat = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getMetricColor = (metric: string, value: number) => {
    switch (metric) {
      case 'roi':
        if (value >= 5) return 'text-green-600'
        if (value >= 2) return 'text-blue-600'
        if (value >= 1) return 'text-yellow-600'
        return 'text-red-600'
      case 'margin':
        if (value >= 30) return 'text-green-600'
        if (value >= 20) return 'text-blue-600'
        if (value >= 10) return 'text-yellow-600'
        return 'text-red-600'
      default:
        return 'text-foreground'
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-[var(--primary)] mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          ROI Calculator
        </h3>

        {!showCalculator ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowCalculator(true)}
            className="w-full"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Calculate ROI
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Input Fields */}
            <div className="space-y-3 bg-muted/30 p-3 rounded mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Product Price: ${productPrice.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={productPrice}
                  onChange={(e) => setProductPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                  <span>$5</span>
                  <span>$500</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Conversion Rate: {conversionRate.toFixed(2)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                  <span>0.1%</span>
                  <span>5%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Profit Margin: {marginPercentage.toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={marginPercentage}
                  onChange={(e) => setMarginPercentage(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                  <span>5%</span>
                  <span>90%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Content Creation Cost: ${contentCreationCost.toFixed(0)}
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={contentCreationCost}
                  onChange={(e) => setContentCreationCost(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                  <span>$100</span>
                  <span>$5,000</span>
                </div>
              </div>
            </div>

            {/* Scenarios */}
            <div className="border-t pt-4 space-y-3">
              {/* Low Scenario */}
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3 rounded">
                <div className="text-xs font-semibold text-red-900 dark:text-red-200 mb-2">Conservative (Low Traffic)</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Visitors:</span>
                    <span className="font-semibold">{roi.lowScenario.monthlyVisitors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Conversions:</span>
                    <span className="font-semibold">{roi.lowScenario.estimatedConversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potential Revenue:</span>
                    <span className="font-semibold">{getCurrencyFormat(roi.lowScenario.potentialRevenue)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="text-muted-foreground font-semibold">Monthly Profit:</span>
                    <span className={`font-bold ${getMetricColor('roi', roi.lowScenario.grossProfit / contentCreationCost)}`}>
                      {getCurrencyFormat(roi.lowScenario.grossProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROI:</span>
                    <span className={`font-bold ${getMetricColor('roi', parseFloat(roi.lowScenario.roiMultiplier))}`}>
                      {roi.lowScenario.roiMultiplier}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Breakeven:</span>
                    <span className="font-semibold">{roi.lowScenario.breakEvenMonths} months</span>
                  </div>
                </div>
              </div>

              {/* Medium Scenario */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded">
                <div className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">Expected (Medium Traffic)</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Visitors:</span>
                    <span className="font-semibold">{roi.mediumScenario.monthlyVisitors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Conversions:</span>
                    <span className="font-semibold">{roi.mediumScenario.estimatedConversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potential Revenue:</span>
                    <span className="font-semibold">{getCurrencyFormat(roi.mediumScenario.potentialRevenue)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="text-muted-foreground font-semibold">Monthly Profit:</span>
                    <span className={`font-bold ${getMetricColor('roi', parseFloat(roi.mediumScenario.roiMultiplier))}`}>
                      {getCurrencyFormat(roi.mediumScenario.grossProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROI:</span>
                    <span className={`font-bold ${getMetricColor('roi', parseFloat(roi.mediumScenario.roiMultiplier))}`}>
                      {roi.mediumScenario.roiMultiplier}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Breakeven:</span>
                    <span className="font-semibold">{roi.mediumScenario.breakEvenMonths} months</span>
                  </div>
                </div>
              </div>

              {/* High Scenario */}
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 rounded">
                <div className="text-xs font-semibold text-green-900 dark:text-green-200 mb-2">Optimistic (High Traffic)</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Visitors:</span>
                    <span className="font-semibold">{roi.highScenario.monthlyVisitors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Conversions:</span>
                    <span className="font-semibold">{roi.highScenario.estimatedConversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potential Revenue:</span>
                    <span className="font-semibold">{getCurrencyFormat(roi.highScenario.potentialRevenue)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="text-muted-foreground font-semibold">Monthly Profit:</span>
                    <span className={`font-bold ${getMetricColor('roi', parseFloat(roi.highScenario.roiMultiplier))}`}>
                      {getCurrencyFormat(roi.highScenario.grossProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROI:</span>
                    <span className={`font-bold ${getMetricColor('roi', parseFloat(roi.highScenario.roiMultiplier))}`}>
                      {roi.highScenario.roiMultiplier}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Breakeven:</span>
                    <span className="font-semibold">{roi.highScenario.breakEvenMonths} months</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {roi.recommendations.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded">
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-200 block mb-2">💡 Recommendations:</span>
                <ul className="text-xs space-y-1 text-amber-800 dark:text-amber-300">
                  {roi.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowCalculator(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default ROICalculatorPanel
