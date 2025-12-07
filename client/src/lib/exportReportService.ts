/**
 * Export Report Service
 * Handles exporting prediction reports as CSV and JSON
 */

import type { PredictionResult, ArticleFeatures } from '../../../shared/types/articleForecaster'

interface ExportData {
  title: string
  seoScore: number
  trafficForecast: {
    low: number
    med: number
    high: number
  }
  adRevenue: number
  recommendations: string[]
  confidence: number
  readTime: number
  conversionRate: number
  features: ArticleFeatures
  generatedAt: string
}

export function generateCSVReport(prediction: PredictionResult, articleTitle: string): string {
  const timestamp = new Date().toISOString()
  
  const rows = [
    ['Article Performance Report'],
    ['Generated', timestamp],
    [],
    ['Article Title', articleTitle],
    ['SEO Score', prediction.seoScore],
    ['Read Time (minutes)', prediction.readTime.toFixed(1)],
    ['Confidence Score', prediction.confidence + '%'],
    ['Estimated Conversion Rate', prediction.conversionRate.toFixed(2) + '%'],
    [],
    ['Traffic Forecast (Monthly Visitors)'],
    ['Low Estimate', prediction.trafficForecast.low],
    ['Medium Estimate', prediction.trafficForecast.med],
    ['High Estimate', prediction.trafficForecast.high],
    [],
    ['Revenue Metrics'],
    ['Estimated Monthly Ad Revenue', '$' + prediction.adRevenue.toFixed(2)],
    [],
    ['Recommendations'],
  ]

  // Add recommendations
  if (prediction.recommendations && prediction.recommendations.length > 0) {
    prediction.recommendations.forEach((rec, idx) => {
      rows.push([`${idx + 1}. ${rec}`])
    })
  } else {
    rows.push(['No recommendations at this time'])
  }

  // Convert to CSV format
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}

export function generateJSONReport(prediction: PredictionResult, articleTitle: string): string {
  const report: ExportData = {
    title: articleTitle,
    seoScore: prediction.seoScore,
    trafficForecast: prediction.trafficForecast,
    adRevenue: prediction.adRevenue,
    recommendations: prediction.recommendations || [],
    confidence: prediction.confidence,
    readTime: prediction.readTime,
    conversionRate: prediction.conversionRate,
    features: prediction.features,
    generatedAt: new Date().toISOString(),
  }

  return JSON.stringify(report, null, 2)
}

export function downloadReport(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
