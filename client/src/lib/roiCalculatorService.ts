/**
 * ROI Calculator Service
 * Calculates product sales potential based on traffic forecast and business metrics
 */

export interface BusinessMetrics {
  productPrice: number
  conversionRate: number // 0-100 (percentage)
  marginPercentage: number // 0-100 (profit margin %)
}

export interface ROIProjection {
  monthlyVisitors: number
  estimatedConversions: number
  potentialRevenue: number
  grossProfit: number
  profitMargin: number
  roiMultiplier: string // e.g., "3.5x"
  breakEvenMonths: number
}

export interface FullROIAnalysis {
  lowScenario: ROIProjection
  mediumScenario: ROIProjection
  highScenario: ROIProjection
  recommendations: string[]
}

export function calculateROI(
  trafficForecast: { low: number; med: number; high: number },
  metrics: BusinessMetrics,
  contentCreationCost: number = 500 // Default cost per article
): FullROIAnalysis {
  const lowProj = calculateScenarioROI(trafficForecast.low, metrics, contentCreationCost)
  const medProj = calculateScenarioROI(trafficForecast.med, metrics, contentCreationCost)
  const highProj = calculateScenarioROI(trafficForecast.high, metrics, contentCreationCost)

  // Generate recommendations
  const recommendations: string[] = []

  if (medProj.profitMargin < 20) {
    recommendations.push('Low profit margin detected. Consider increasing product price or reducing article creation costs.')
  }

  if (medProj.breakEvenMonths > 6) {
    recommendations.push(
      `ROI breakeven is ${medProj.breakEvenMonths} months. This article needs significant traffic to be profitable quickly.`
    )
  }

  if (metrics.conversionRate < 1) {
    recommendations.push(
      'Conversion rate is below 1%. Focus on improving call-to-action and landing page optimization.'
    )
  }

  if (medProj.estimatedConversions < 10) {
    recommendations.push(
      'Low conversion volume. This product/topic may have limited market demand. Consider pairing with related content.'
    )
  }

  if (metrics.marginPercentage < 30) {
    recommendations.push(
      'Profit margin is below 30%. Maximize ROI by reducing product cost or finding a higher-margin offering.'
    )
  }

  // Check if ROI is excellent (> 10x multiplier)
  const roiMultiplierNum = parseFloat(medProj.roiMultiplier.replace('x', ''))
  if (roiMultiplierNum >= 10) {
    recommendations.push(
      '🎉 Exceptional ROI potential! This content has strong monetization potential. Prioritize this type of content.'
    )
  }

  return {
    lowScenario: lowProj,
    mediumScenario: medProj,
    highScenario: highProj,
    recommendations: recommendations.length > 0 ? recommendations : ['Standard ROI metrics. Monitor performance.'],
  }
}

function calculateScenarioROI(
  monthlyVisitors: number,
  metrics: BusinessMetrics,
  creationCost: number
): ROIProjection {
  const estimatedConversions = Math.floor((monthlyVisitors * metrics.conversionRate) / 100)
  const potentialRevenue = estimatedConversions * metrics.productPrice
  const grossProfit = potentialRevenue * (metrics.marginPercentage / 100)
  const profitMargin = potentialRevenue > 0 ? (grossProfit / potentialRevenue) * 100 : 0
  const roiMultiplierNum = creationCost > 0 ? grossProfit / creationCost : 0
  const roiMultiplier = `${roiMultiplierNum.toFixed(1)}x`

  // Breakeven: when cumulative gross profit equals creation cost
  const monthlyNetProfit = grossProfit
  const breakEvenMonths = monthlyNetProfit > 0 ? Math.ceil(creationCost / monthlyNetProfit) : 999

  return {
    monthlyVisitors,
    estimatedConversions,
    potentialRevenue,
    grossProfit,
    profitMargin,
    roiMultiplier,
    breakEvenMonths: Math.min(breakEvenMonths, 120), // Cap at 10 years
  }
}

// Extract multiplier as number for sorting
// function getROIMultiplierNum(roiMultiplier: string): number {
//   return parseFloat(roiMultiplier.replace('x', ''))
// }

// Extend ROIProjection to include the number version for sorting
// interface ROIProjectionWithNum extends ROIProjection {
//   roiMultiplierNum: number
// }

// Update the return type function to include the roiMultiplierNum
// function calculateScenarioROIWithNum(
//   monthlyVisitors: number,
//   metrics: BusinessMetrics,
//   creationCost: number
// ): ROIProjectionWithNum {
//   const estimatedConversions = Math.floor((monthlyVisitors * metrics.conversionRate) / 100)
//   const potentialRevenue = estimatedConversions * metrics.productPrice
//   const grossProfit = potentialRevenue * (metrics.marginPercentage / 100)
//   const profitMargin = potentialRevenue > 0 ? (grossProfit / potentialRevenue) * 100 : 0
//   const roiMultiplierNum = creationCost > 0 ? grossProfit / creationCost : 0
//   const roiMultiplier = `${roiMultiplierNum.toFixed(1)}x`
//   const monthlyNetProfit = grossProfit
//   const breakEvenMonths = monthlyNetProfit > 0 ? Math.ceil(creationCost / monthlyNetProfit) : 999

//   return {
//     monthlyVisitors,
//     estimatedConversions,
//     potentialRevenue,
//     grossProfit,
//     profitMargin,
//     roiMultiplier,
//     breakEvenMonths: Math.min(breakEvenMonths, 120),
//     roiMultiplierNum,
//   }
// }

