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

export interface ExpandedMetrics {
  // Financial
  averageCost: number;
  costRange: { min: number; max: number };
  averageROI: number;
  
  // Academic Quality
  averageRanking: number;
  rankingRange: { min: number; max: number };
  averageResearchScore: number;
  
  // Admissions
  averageAcceptanceRate: number;
  acceptanceRateRange: { min: number; max: number };
  
  // Career Outcomes
  averageEmploymentRate: number;
  averageStartingSalary: number;
  averageTimeToEmployment: number;
  
  // Student Experience
  averageStudentSatisfaction: number;
  averageGeographicDiversity: number;
  averageInternshipRate: number;
  
  // Opportunities
  totalIndustryPartnerships: number;
  averagePartnershipsPerUniversity: number;
}

export interface ExpandedRecommendations {
  bestValue?: SmartRecommendation;
  mostPrestigious?: SmartRecommendation;
  mostAffordable?: SmartRecommendation;
  bestForInternational?: SmartRecommendation;
  bestCareerOutcomes?: SmartRecommendation;
  bestResearch?: SmartRecommendation;
  bestStudentLife?: SmartRecommendation;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface UniversityRiskAssessment {
  universityId: string;
  universityName: string;
  overallRiskScore: number; // 0-100
  riskFactors: RiskFactor[];
  recommendations: string[];
}

export interface TrendAnalysis {
  universityId: string;
  universityName: string;
  rankingTrend: { current: number; fiveYearChange: number };
  costTrend: { current: number; annualGrowthPercent: number };
  employmentTrend: { current: number; fiveYearChange: number };
}

export interface ComparisonAnalysis {
  metrics: ExpandedMetrics;
  recommendations: ExpandedRecommendations;
  riskAssessments: UniversityRiskAssessment[];
  trends: TrendAnalysis[];
}

export class ComparisonAnalysisService {
  /**
   * Analyze a set of universities with expanded metrics and recommendations
   */
  static analyze(universities: University[], userWeights?: Record<string, number>): ComparisonAnalysis {
    if (universities.length === 0) {
      throw new Error('At least one university is required for analysis');
    }

    const metrics = this.calculateExpandedMetrics(universities);
    const recommendations = this.generateExpandedRecommendations(universities, userWeights);
    const riskAssessments = this.generateRiskAssessments(universities);
    const trends = this.analyzeTrends(universities);

    return {
      metrics,
      recommendations,
      riskAssessments,
      trends,
    };
  }

  /**
   * Calculate comprehensive metrics across universities
   */
  private static calculateExpandedMetrics(universities: University[]): ExpandedMetrics {
    // Financial metrics
    const costs = universities.map(u => 
      u.tuitionInternational || u.tuitionOutState || 0
    ).filter(c => c > 0);

    const roi = universities.map(u => u.ROIPercentage || 0).filter(r => r > 0);

    // Academic metrics
    const rankings = universities.map(u => 
      getRanking(u) || Infinity
    ).filter(r => r !== Infinity);

    const researchScores = universities.map(u => u.researchOutputScore || 0).filter(r => r > 0);

    // Admissions metrics
    const acceptanceRates = universities.map(u => 
      u.acceptanceRate || 0
    ).filter(r => r > 0);

    // Career outcomes
    const employmentRates = universities.map(u => u.employmentRate || 0).filter(r => r > 0);
    const startingSalaries = universities.map(u => u.averageStartingSalary || 0).filter(s => s > 0);
    const timeToEmployment = universities.map(u => u.timeToEmploymentMonths || 0).filter(t => t > 0);

    // Student experience
    const satisfactionScores = universities.map(u => u.studentSatisfactionScore || 0).filter(s => s > 0);
    const diversityScores = universities.map(u => u.geographicDiversityScore || 0).filter(d => d > 0);
    const internshipRates = universities.map(u => u.internshipPlacementRate || 0).filter(r => r > 0);

    // Industry partnerships
    const partnerships = universities.map(u => u.partnerCompaniesCount || 0);

    return {
      averageCost: costs.length > 0 
        ? costs.reduce((sum, c) => sum + c, 0) / costs.length 
        : 0,
      costRange: {
        min: costs.length > 0 ? Math.min(...costs) : 0,
        max: costs.length > 0 ? Math.max(...costs) : 0,
      },
      averageROI: roi.length > 0 
        ? roi.reduce((sum, r) => sum + r, 0) / roi.length 
        : 0,
      averageRanking: rankings.length > 0 
        ? rankings.reduce((sum, r) => sum + r, 0) / rankings.length 
        : 0,
      rankingRange: {
        min: rankings.length > 0 ? Math.min(...rankings) : 0,
        max: rankings.length > 0 ? Math.max(...rankings) : 0,
      },
      averageResearchScore: researchScores.length > 0 
        ? researchScores.reduce((sum, s) => sum + s, 0) / researchScores.length 
        : 0,
      averageAcceptanceRate: acceptanceRates.length > 0 
        ? acceptanceRates.reduce((sum, r) => sum + r, 0) / acceptanceRates.length 
        : 0,
      acceptanceRateRange: {
        min: acceptanceRates.length > 0 ? Math.min(...acceptanceRates) : 0,
        max: acceptanceRates.length > 0 ? Math.max(...acceptanceRates) : 0,
      },
      averageEmploymentRate: employmentRates.length > 0 
        ? employmentRates.reduce((sum, r) => sum + r, 0) / employmentRates.length 
        : 0,
      averageStartingSalary: startingSalaries.length > 0 
        ? startingSalaries.reduce((sum, s) => sum + s, 0) / startingSalaries.length 
        : 0,
      averageTimeToEmployment: timeToEmployment.length > 0 
        ? timeToEmployment.reduce((sum, t) => sum + t, 0) / timeToEmployment.length 
        : 0,
      averageStudentSatisfaction: satisfactionScores.length > 0 
        ? satisfactionScores.reduce((sum, s) => sum + s, 0) / satisfactionScores.length 
        : 0,
      averageGeographicDiversity: diversityScores.length > 0 
        ? diversityScores.reduce((sum, d) => sum + d, 0) / diversityScores.length 
        : 0,
      averageInternshipRate: internshipRates.length > 0 
        ? internshipRates.reduce((sum, r) => sum + r, 0) / internshipRates.length 
        : 0,
      totalIndustryPartnerships: partnerships.reduce((sum, p) => sum + p, 0),
      averagePartnershipsPerUniversity: partnerships.length > 0 
        ? partnerships.reduce((sum, p) => sum + p, 0) / partnerships.length 
        : 0,
    };
  }

  /**
   * Generate expanded recommendations including career outcomes and research
   */
  private static generateExpandedRecommendations(
    universities: University[],
    userWeights?: Record<string, number>
  ): ExpandedRecommendations {
    const recommendations: ExpandedRecommendations = {};

    // Apply user weights or use defaults
    const weights = userWeights || {
      ranking: 0.25,
      cost: 0.25,
      acceptance: 0.15,
      employmentRate: 0.15,
      studentSatisfaction: 0.10,
      research: 0.10,
    };

    // 1. Best Value: Balance of ranking and affordability
    const bestValue = this.findBestValue(universities, weights);
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

    // 5. Best Career Outcomes
    const bestCareer = this.findBestCareerOutcomes(universities);
    if (bestCareer) recommendations.bestCareerOutcomes = bestCareer;

    // 6. Best Research
    const bestResearch = this.findBestResearch(universities);
    if (bestResearch) recommendations.bestResearch = bestResearch;

    // 7. Best Student Life
    const bestLife = this.findBestStudentLife(universities);
    if (bestLife) recommendations.bestStudentLife = bestLife;

    return recommendations;
  }

  /**
   * Find best value university (ranking vs cost optimization)
   */
  private static findBestValue(
    universities: University[],
    weights: Record<string, number>
  ): SmartRecommendation | null {
    const validUniversities = universities.filter(u => 
      getRanking(u) && 
      (u.tuitionInternational || u.tuitionOutState)
    );

    if (validUniversities.length === 0) return null;

    const scored = validUniversities.map(u => {
      const ranking = getRanking(u) || 999;
      const cost = u.tuitionInternational || u.tuitionOutState || 99999;
      const acceptance = u.acceptanceRate || 0.5;
      const employment = u.employmentRate || 0.7;
      const satisfaction = u.studentSatisfactionScore || 2.5;
      const research = u.researchOutputScore || 40;

      // Normalize scores (0-100 scale)
      const rankingScore = Math.max(0, 100 - (ranking / 10));
      const costScore = Math.max(0, 100 - (cost / 1000));
      const acceptanceScore = acceptance * 100;
      const employmentScore = employment * 100;
      const satisfactionScore = (satisfaction / 5) * 100;
      const researchScore = Math.min(research, 100);

      // Apply weights
      const valueScore = 
        (rankingScore * (weights.ranking || 0.25)) +
        (costScore * (weights.cost || 0.25)) +
        (acceptanceScore * (weights.acceptance || 0.15)) +
        (employmentScore * (weights.employmentRate || 0.15)) +
        (satisfactionScore * (weights.studentSatisfaction || 0.10)) +
        (researchScore * (weights.research || 0.10));

      return { university: u, score: valueScore, ranking, cost };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    return {
      universityId: best.university.id,
      universityName: best.university.name,
      score: Math.round(best.score),
      reason: `Best balance of prestige (Rank #${best.ranking}) and affordability ($${best.cost.toLocaleString()}/year)`,
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
      score: Math.max(0, 100 - ranking / 10),
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

    const sorted = [...validUniversities].sort((a, b) => {
      const costA = a.tuitionInternational || a.tuitionOutState || 999999;
      const costB = b.tuitionInternational || b.tuitionOutState || 999999;
      return costA - costB;
    });

    const best = sorted[0];
    const cost = best.tuitionInternational || best.tuitionOutState!;
    
    const avgCost = validUniversities.reduce((sum, u) => 
      sum + (u.tuitionInternational || u.tuitionOutState || 0), 0
    ) / validUniversities.length;
    const savings = avgCost - cost;

    return {
      universityId: best.id,
      universityName: best.name,
      score: Math.round((1 - cost / 100000) * 100),
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

    const scored = validUniversities.map(u => {
      let score = 0;
      
      if (u.percentInternational) {
        score += Math.min(u.percentInternational * 100 * 5, 50);
      }
      
      if (u.scholarshipsIntl) {
        score += 30;
      }
      
      if (u.visaDurationMonths) {
        score += Math.min(u.visaDurationMonths / 36 * 20, 20);
      }
      
      return { university: u, score };
    });

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

  /**
   * Find university with best career outcomes
   */
  private static findBestCareerOutcomes(universities: University[]): SmartRecommendation | null {
    const validUniversities = universities.filter(u => 
      u.employmentRate || u.averageStartingSalary
    );

    if (validUniversities.length === 0) return null;

    const scored = validUniversities.map(u => {
      let score = 0;
      
      if (u.employmentRate) {
        score += u.employmentRate * 50;
      }
      
      if (u.averageStartingSalary) {
        score += Math.min(u.averageStartingSalary / 2000, 50);
      }
      
      return { university: u, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    const reasons: string[] = [];
    if (best.university.employmentRate) {
      reasons.push(`${(best.university.employmentRate * 100).toFixed(0)}% employment rate`);
    }
    if (best.university.averageStartingSalary) {
      reasons.push(`$${best.university.averageStartingSalary.toLocaleString()} avg starting salary`);
    }

    return {
      universityId: best.university.id,
      universityName: best.university.name,
      score: Math.round(best.score),
      reason: `Best career outcomes: ${reasons.join(', ')}`,
    };
  }

  /**
   * Find university with best research opportunities
   */
  private static findBestResearch(universities: University[]): SmartRecommendation | null {
    const validUniversities = universities.filter(u => 
      u.researchOutputScore || u.fundedResearch
    );

    if (validUniversities.length === 0) return null;

    const scored = validUniversities.map(u => {
      let score = 0;
      
      if (u.researchOutputScore) {
        score += u.researchOutputScore;
      }
      
      if (u.fundedResearch) {
        score += Math.min(u.fundedResearch / 100, 30);
      }
      
      return { university: u, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    const reasons: string[] = [];
    if (best.university.researchOutputScore) {
      reasons.push(`Research score: ${best.university.researchOutputScore.toFixed(0)}/100`);
    }
    if (best.university.fundedResearch) {
      reasons.push(`$${best.university.fundedResearch}M in funded research`);
    }

    return {
      universityId: best.university.id,
      universityName: best.university.name,
      score: Math.round(best.score),
      reason: `Best research opportunities: ${reasons.join(', ')}`,
    };
  }

  /**
   * Find university with best student life
   */
  private static findBestStudentLife(universities: University[]): SmartRecommendation | null {
    const validUniversities = universities.filter(u => 
      u.studentSatisfactionScore || u.studentLifeScore
    );

    if (validUniversities.length === 0) return null;

    const scored = validUniversities.map(u => {
      let score = 0;
      
      if (u.studentSatisfactionScore) {
        score += u.studentSatisfactionScore * 20;
      }
      
      if (u.studentLifeScore) {
        score += u.studentLifeScore * 20;
      }
      
      if (u.safetyRating) {
        score += u.safetyRating * 10;
      }
      
      return { university: u, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    return {
      universityId: best.university.id,
      universityName: best.university.name,
      score: Math.round(best.score),
      reason: `Best student life and campus experience`,
    };
  }

  /**
   * Generate risk assessments for universities in the comparison
   */
  private static generateRiskAssessments(universities: University[]): UniversityRiskAssessment[] {
    return universities.map(u => {
      const riskFactors: RiskFactor[] = [];
      let riskScore = 0;

      // High acceptance rate (easier to get in but potentially lower quality)
      if (u.acceptanceRate && u.acceptanceRate > 0.75) {
        riskFactors.push({
          factor: 'High acceptance rate',
          severity: 'medium',
          description: `${(u.acceptanceRate * 100).toFixed(0)}% acceptance rate - less selective institution`,
        });
        riskScore += 10;
      }

      // Low employment rate
      if (u.employmentRate && u.employmentRate < 0.8) {
        riskFactors.push({
          factor: 'Lower employment rate',
          severity: 'high',
          description: `Only ${(u.employmentRate * 100).toFixed(0)}% employment rate - career outcomes may be challenging`,
        });
        riskScore += 20;
      }

      // Very high cost with low ROI
      const cost = u.tuitionInternational || u.tuitionOutState || 0;
      if (cost > 80000 && u.ROIPercentage && u.ROIPercentage < 50) {
        riskFactors.push({
          factor: 'High cost with low ROI',
          severity: 'high',
          description: `High tuition cost ($${cost.toLocaleString()}) but lower return on investment`,
        });
        riskScore += 25;
      }

      // Low scholarship availability
      if (!u.scholarshipsIntl && u.percentInternational && u.percentInternational > 0.1) {
        riskFactors.push({
          factor: 'Limited international scholarships',
          severity: 'medium',
          description: 'International students may face high financial burden',
        });
        riskScore += 15;
      }

      // Low graduation rate
      if (u.graduationRate && u.graduationRate < 0.7) {
        riskFactors.push({
          factor: 'Low graduation rate',
          severity: 'medium',
          description: `Only ${(u.graduationRate * 100).toFixed(0)}% of students graduate - may indicate retention issues`,
        });
        riskScore += 15;
      }

      const recommendations: string[] = [];
      if (riskScore > 50) {
        recommendations.push('Consider comparing with other universities in this group');
        recommendations.push('Investigate specific programs and support services');
      }
      if (riskFactors.some(f => f.severity === 'high')) {
        recommendations.push('Research student support services and academic resources');
        recommendations.push('Review detailed program outcomes and reviews');
      }

      return {
        universityId: u.id,
        universityName: u.name,
        overallRiskScore: Math.min(riskScore, 100),
        riskFactors,
        recommendations,
      };
    });
  }

  /**
   * Analyze trends for universities
   */
  private static analyzeTrends(universities: University[]): TrendAnalysis[] {
    return universities.map(u => ({
      universityId: u.id,
      universityName: u.name,
      rankingTrend: {
        current: getRanking(u) || 0,
        fiveYearChange: 0, // Would require historical data from database
      },
      costTrend: {
        current: u.tuitionInternational || u.tuitionOutState || 0,
        annualGrowthPercent: 3.5, // Average historical inflation
      },
      employmentTrend: {
        current: u.employmentRate || 0,
        fiveYearChange: 0, // Would require historical data from database
      },
    }));
  }
}

