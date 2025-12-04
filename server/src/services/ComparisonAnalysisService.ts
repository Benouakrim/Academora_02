import { University } from '@prisma/client';

// Helper to extract ranking from JSON
function getRanking(university: University): number | null {
  if (university.rankings && typeof university.rankings === 'object') {
    const rankings = university.rankings as any;
    // Try different ranking sources
    return rankings.usNews || rankings.global || rankings.forbes || rankings.qs || null;
  }
  return null;
}

export interface SmartRecommendation {
  universityId: string;
  universityName: string;
  score: number;
  reason: string;
}

export interface ComparisonMetrics {
  averageCost: number;
  averageRanking: number;
  averageAcceptanceRate: number;
  costRange: { min: number; max: number };
  rankingRange: { min: number; max: number };
}

export interface ComparisonAnalysis {
  metrics: ComparisonMetrics;
  recommendations: {
    bestValue?: SmartRecommendation;
    mostPrestigious?: SmartRecommendation;
    mostAffordable?: SmartRecommendation;
    bestForInternational?: SmartRecommendation;
  };
}

export class ComparisonAnalysisService {
  /**
   * Analyze a set of universities and generate smart recommendations
   */
  static analyze(universities: University[]): ComparisonAnalysis {
    if (universities.length === 0) {
      throw new Error('At least one university is required for analysis');
    }

    const metrics = this.calculateMetrics(universities);
    const recommendations = this.generateRecommendations(universities);

    return {
      metrics,
      recommendations,
    };
  }

  /**
   * Calculate comparative metrics across universities
   */
  private static calculateMetrics(universities: University[]): ComparisonMetrics {
    const costs = universities.map(u => 
      u.tuitionInternational || u.tuitionOutState || 0
    ).filter(c => c > 0);

    const rankings = universities.map(u => 
      getRanking(u) || Infinity
    ).filter(r => r !== Infinity);

    const acceptanceRates = universities.map(u => 
      u.acceptanceRate || 0
    ).filter(r => r > 0);

    return {
      averageCost: costs.length > 0 
        ? costs.reduce((sum, c) => sum + c, 0) / costs.length 
        : 0,
      averageRanking: rankings.length > 0 
        ? rankings.reduce((sum, r) => sum + r, 0) / rankings.length 
        : 0,
      averageAcceptanceRate: acceptanceRates.length > 0 
        ? acceptanceRates.reduce((sum, r) => sum + r, 0) / acceptanceRates.length 
        : 0,
      costRange: {
        min: costs.length > 0 ? Math.min(...costs) : 0,
        max: costs.length > 0 ? Math.max(...costs) : 0,
      },
      rankingRange: {
        min: rankings.length > 0 ? Math.min(...rankings) : 0,
        max: rankings.length > 0 ? Math.max(...rankings) : 0,
      },
    };
  }

  /**
   * Generate smart recommendations based on different criteria
   */
  private static generateRecommendations(
    universities: University[]
  ): ComparisonAnalysis['recommendations'] {
    const recommendations: ComparisonAnalysis['recommendations'] = {};

    // 1. Best Value: Balance of ranking and affordability
    const bestValue = this.findBestValue(universities);
    if (bestValue) recommendations.bestValue = bestValue;

    // 2. Most Prestigious: Highest global ranking
    const mostPrestigious = this.findMostPrestigious(universities);
    if (mostPrestigious) recommendations.mostPrestigious = mostPrestigious;

    // 3. Most Affordable: Lowest tuition cost
    const mostAffordable = this.findMostAffordable(universities);
    if (mostAffordable) recommendations.mostAffordable = mostAffordable;

    // 4. Best for International: Best international support
    const bestForInternational = this.findBestForInternational(universities);
    if (bestForInternational) recommendations.bestForInternational = bestForInternational;

    return recommendations;
  }

  /**
   * Find best value university (ranking vs cost optimization)
   */
  private static findBestValue(universities: University[]): SmartRecommendation | null {
    const validUniversities = universities.filter(u => 
      getRanking(u) && 
      (u.tuitionInternational || u.tuitionOutState)
    );

    if (validUniversities.length === 0) return null;

    // Calculate value score: Lower is better
    // Formula: (Ranking / 1000) + (Cost / 10000)
    // This balances ranking and cost on similar scales
    const scored = validUniversities.map(u => {
      const ranking = getRanking(u) || 999;
      const cost = u.tuitionInternational || u.tuitionOutState || 99999;
      
      // Normalize scores (lower ranking = better, lower cost = better)
      const rankingScore = ranking / 1000;
      const costScore = cost / 100000;
      
      // Combined value score (lower is better)
      const valueScore = rankingScore + costScore;
      
      return { university: u, score: valueScore, ranking, cost };
    });

    // Sort by value score (ascending - lower is better)
    scored.sort((a, b) => a.score - b.score);
    const best = scored[0];

    return {
      universityId: best.university.id,
      universityName: best.university.name,
      score: Math.round((1 / best.score) * 100), // Convert to 0-100 scale for display
      reason: `Best balance of prestige (Rank #${best.ranking}) and affordability ($${best.cost.toLocaleString()})`,
    };
  }

  /**
   * Find most prestigious university by ranking
   */
  private static findMostPrestigious(universities: University[]): SmartRecommendation | null {
    const validUniversities = universities.filter(u => 
      getRanking(u)
    );

    if (validUniversities.length === 0) return null;

    // Sort by ranking (ascending - lower ranking number = more prestigious)
    const sorted = [...validUniversities].sort((a, b) => {
      const rankA = getRanking(a) || 9999;
      const rankB = getRanking(b) || 9999;
      return rankA - rankB;
    });

    const best = sorted[0];
    const ranking = getRanking(best) || 999;

    return {
      universityId: best.id,
      universityName: best.name,
      score: Math.max(0, 100 - ranking / 10), // Convert ranking to 0-100 score
      reason: `Highest global ranking (#${ranking}) among selected universities`,
    };
  }

  /**
   * Find most affordable university
   */
  private static findMostAffordable(universities: University[]): SmartRecommendation | null {
    const validUniversities = universities.filter(u => 
      u.tuitionInternational || u.tuitionOutState
    );

    if (validUniversities.length === 0) return null;

    // Sort by cost (ascending - lower is better)
    const sorted = [...validUniversities].sort((a, b) => {
      const costA = a.tuitionInternational || a.tuitionOutState || 999999;
      const costB = b.tuitionInternational || b.tuitionOutState || 999999;
      return costA - costB;
    });

    const best = sorted[0];
    const cost = best.tuitionInternational || best.tuitionOutState!;
    
    // Calculate savings vs average
    const avgCost = validUniversities.reduce((sum, u) => 
      sum + (u.tuitionInternational || u.tuitionOutState || 0), 0
    ) / validUniversities.length;
    const savings = avgCost - cost;

    return {
      universityId: best.id,
      universityName: best.name,
      score: Math.round((1 - cost / 100000) * 100), // Affordability score
      reason: `Lowest tuition cost ($${cost.toLocaleString()}/year)${
        savings > 0 ? `, saving ~$${Math.round(savings).toLocaleString()} vs average` : ''
      }`,
    };
  }

  /**
   * Find best university for international students
   */
  private static findBestForInternational(universities: University[]): SmartRecommendation | null {
    const validUniversities = universities.filter(u => 
      u.percentInternational || u.scholarshipsIntl
    );

    if (validUniversities.length === 0) return null;

    // Calculate international friendliness score
    const scored = validUniversities.map(u => {
      let score = 0;
      
      // International student percentage (0-50 points)
      if (u.percentInternational) {
        score += Math.min(u.percentInternational * 100 * 5, 50); // Max 50 points
      }
      
      // International scholarships available (30 points)
      if (u.scholarshipsIntl) {
        score += 30;
      }
      
      // Post-grad visa duration (0-20 points)
      if (u.visaDurationMonths) {
        score += Math.min(u.visaDurationMonths / 36 * 20, 20); // Max 20 points
      }
      
      return { university: u, score };
    });

    // Sort by score (descending - higher is better)
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    const reasons: string[] = [];
    if (best.university.percentInternational) {
      reasons.push(`${(best.university.percentInternational * 100).toFixed(0)}% international students`);
    }
    if (best.university.scholarshipsIntl) {
      reasons.push('offers international scholarships');
    }
    if (best.university.visaDurationMonths) {
      reasons.push(`${best.university.visaDurationMonths}-month post-grad visa`);
    }

    return {
      universityId: best.university.id,
      universityName: best.university.name,
      score: Math.round(best.score),
      reason: `Best for international students: ${reasons.join(', ')}`,
    };
  }
}
