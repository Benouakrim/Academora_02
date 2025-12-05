import { University } from '@prisma/client';

/**
 * Service for generating natural language comparative insights
 */
export class ComparativeInsightsService {
  /**
   * Generate cost-benefit analysis insights
   */
  static generateCostBenefitAnalysis(universities: University[]): string {
    if (universities.length < 2) return '';

    // Sort by cost
    const byPrice = [...universities].sort(
      (a, b) =>
        (a.tuitionInternational || a.tuitionOutState || Infinity) -
        (b.tuitionInternational || b.tuitionOutState || Infinity)
    );

    const cheapest = byPrice[0];
    const mostExpensive = byPrice[universities.length - 1];

    const cheapestCost = cheapest.tuitionInternational || cheapest.tuitionOutState || 0;
    const expensiveCost =
      mostExpensive.tuitionInternational || mostExpensive.tuitionOutState || 0;
    const difference = expensiveCost - cheapestCost;

    let insight = `Tuition ranges from $${cheapestCost.toLocaleString()} (${cheapest.name}) `;
    insight += `to $${expensiveCost.toLocaleString()} (${mostExpensive.name}), `;
    insight += `a difference of $${difference.toLocaleString()} per year.\n`;

    // Compare ROI if available
    const withROI = universities.filter((u) => u.ROIPercentage !== null);
    if (withROI.length >= 2) {
      const bestROI = withROI.reduce((prev, current) =>
        (prev.ROIPercentage || 0) > (current.ROIPercentage || 0) ? prev : current
      );
      const worstROI = withROI.reduce((prev, current) =>
        (prev.ROIPercentage || 0) < (current.ROIPercentage || 0) ? prev : current
      );

      insight += `${bestROI.name} offers the best ROI at ${bestROI.ROIPercentage}%, `;
      insight += `while ${worstROI.name} has a lower ROI at ${worstROI.ROIPercentage}%. `;
      insight += `Consider the long-term financial impact of your choice.`;
    }

    return insight;
  }

  /**
   * Generate career outcome insights
   */
  static generateCareerOutcomeAnalysis(universities: University[]): string {
    if (universities.length < 2) return '';

    const withEmployment = universities.filter((u) => u.employmentRate !== null);
    if (withEmployment.length === 0) return '';

    const sorted = [...withEmployment].sort(
      (a, b) => (b.employmentRate || 0) - (a.employmentRate || 0)
    );

    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    let insight = `Employment outcomes vary significantly across your selections. `;
    insight += `${best.name} leads with ${((best.employmentRate || 0) * 100).toFixed(0)}% `;
    insight += `employment rate within 6 months of graduation. `;

    if (worst.employmentRate !== best.employmentRate) {
      insight += `${worst.name} has ${((worst.employmentRate || 0) * 100).toFixed(0)}% employment rate. `;
    }

    const avgSalary = universities
      .filter((u) => u.averageStartingSalary)
      .reduce((sum, u) => sum + (u.averageStartingSalary || 0), 0) / universities.length;

    if (avgSalary > 0) {
      insight += `Average starting salary across selections: $${Math.round(avgSalary).toLocaleString()}.`;
    }

    return insight;
  }

  /**
   * Generate acceptance difficulty insights
   */
  static generateAcceptanceDifficultyAnalysis(universities: University[]): string {
    if (universities.length < 2) return '';

    const withAcceptance = universities.filter((u) => u.acceptanceRate !== null);
    if (withAcceptance.length === 0) return '';

    const sorted = [...withAcceptance].sort((a, b) => (a.acceptanceRate || 1) - (b.acceptanceRate || 1));

    const mostSelective = sorted[0];
    const leastSelective = sorted[sorted.length - 1];

    let insight = `Admission competitiveness differs substantially across your selections. `;
    insight += `${mostSelective.name} is the most selective at ${((mostSelective.acceptanceRate || 0) * 100).toFixed(1)}% `;
    insight += `acceptance rate, while ${leastSelective.name} accepts ${((leastSelective.acceptanceRate || 0) * 100).toFixed(1)}%. `;

    const avgAcceptance =
      withAcceptance.reduce((sum, u) => sum + (u.acceptanceRate || 0), 0) / withAcceptance.length;
    insight += `Average acceptance rate: ${(avgAcceptance * 100).toFixed(1)}%.`;

    return insight;
  }

  /**
   * Generate student experience insights
   */
  static generateStudentExperienceAnalysis(universities: University[]): string {
    if (universities.length < 2) return '';

    const withSatisfaction = universities.filter((u) => u.studentSatisfactionScore !== null);
    if (withSatisfaction.length === 0) return '';

    const sorted = [...withSatisfaction].sort(
      (a, b) => (b.studentSatisfactionScore || 0) - (a.studentSatisfactionScore || 0)
    );

    const best = sorted[0];
    const avg =
      withSatisfaction.reduce((sum, u) => sum + (u.studentSatisfactionScore || 0), 0) /
      withSatisfaction.length;

    let insight = `Student satisfaction scores indicate ${best.name} leads with `;
    insight += `${best.studentSatisfactionScore?.toFixed(1)}/5 rating. Average across selections: `;
    insight += `${avg.toFixed(1)}/5. `;

    const withLife = universities.filter((u) => u.studentLifeScore !== null);
    if (withLife.length > 0) {
      const lifeAvg =
        withLife.reduce((sum, u) => sum + (u.studentLifeScore || 0), 0) / withLife.length;
      insight += `Campus life quality averages ${lifeAvg.toFixed(1)}/5 across your selections.`;
    }

    return insight;
  }

  /**
   * Generate research opportunity insights
   */
  static generateResearchOpportunitiesAnalysis(universities: University[]): string {
    if (universities.length < 2) return '';

    const withResearch = universities.filter((u) => u.researchOutputScore !== null);
    if (withResearch.length === 0) return '';

    const sorted = [...withResearch].sort(
      (a, b) => (b.researchOutputScore || 0) - (a.researchOutputScore || 0)
    );

    const best = sorted[0];
    const avg =
      withResearch.reduce((sum, u) => sum + (u.researchOutputScore || 0), 0) /
      withResearch.length;

    let insight = `Research excellence varies across your selections. `;
    insight += `${best.name} leads with research score of ${best.researchOutputScore?.toFixed(0)}/100. `;
    insight += `Average research score: ${avg.toFixed(0)}/100. `;

    const withFunding = universities.filter((u) => u.fundedResearch !== null);
    if (withFunding.length > 0) {
      const totalFunding = withFunding.reduce((sum, u) => sum + (u.fundedResearch || 0), 0);
      insight += `Combined annual funded research: $${totalFunding}M across selections.`;
    }

    return insight;
  }

  /**
   * Generate international opportunities insights
   */
  static generateInternationalOpportunitiesAnalysis(universities: University[]): string {
    if (universities.length < 2) return '';

    const international = universities.filter((u) => u.percentInternational !== null);
    if (international.length === 0) return '';

    const sorted = [...international].sort(
      (a, b) => (b.percentInternational || 0) - (a.percentInternational || 0)
    );

    const most = sorted[0];
    const least = sorted[sorted.length - 1];

    let insight = `International student representation ranges from `;
    insight += `${((least.percentInternational || 0) * 100).toFixed(1)}% `;
    insight += `at ${least.name} to ${((most.percentInternational || 0) * 100).toFixed(1)}% at ${most.name}. `;

    const withScholarships = universities.filter((u) => u.scholarshipsIntl);
    if (withScholarships.length > 0) {
      insight += `${withScholarships.length} of ${universities.length} universities offer international scholarships. `;
    }

    const withVisa = universities.filter((u) => u.visaDurationMonths !== null);
    if (withVisa.length > 0) {
      const avgVisa =
        withVisa.reduce((sum, u) => sum + (u.visaDurationMonths || 0), 0) / withVisa.length;
      insight += `Average post-graduate work visa duration: ${Math.round(avgVisa)} months.`;
    }

    return insight;
  }

  /**
   * Generate a comprehensive comparison summary
   */
  static generateComprehensiveSummary(universities: University[]): string {
    if (universities.length === 0) return '';

    let summary = `## Comprehensive University Comparison Summary\n\n`;

    summary += `You are comparing ${universities.length} universities: `;
    summary += universities.map((u) => u.name).join(', ') + '\n\n';

    const costAnalysis = this.generateCostBenefitAnalysis(universities);
    if (costAnalysis) {
      summary += `### Financial Analysis\n${costAnalysis}\n\n`;
    }

    const careerAnalysis = this.generateCareerOutcomeAnalysis(universities);
    if (careerAnalysis) {
      summary += `### Career Outcomes\n${careerAnalysis}\n\n`;
    }

    const acceptanceAnalysis = this.generateAcceptanceDifficultyAnalysis(universities);
    if (acceptanceAnalysis) {
      summary += `### Admission Competitiveness\n${acceptanceAnalysis}\n\n`;
    }

    const experienceAnalysis = this.generateStudentExperienceAnalysis(universities);
    if (experienceAnalysis) {
      summary += `### Student Experience\n${experienceAnalysis}\n\n`;
    }

    const researchAnalysis = this.generateResearchOpportunitiesAnalysis(universities);
    if (researchAnalysis) {
      summary += `### Research Opportunities\n${researchAnalysis}\n\n`;
    }

    const intlAnalysis = this.generateInternationalOpportunitiesAnalysis(universities);
    if (intlAnalysis) {
      summary += `### International Opportunities\n${intlAnalysis}\n\n`;
    }

    return summary;
  }
}
