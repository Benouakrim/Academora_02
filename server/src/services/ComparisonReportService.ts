import { University } from '@prisma/client';
import { ComparisonAnalysisService } from './ComparisonAnalysisService';
import { ComparativeInsightsService } from './ComparativeInsightsService';

/**
 * Service for generating reports and export functionality
 */
export class ComparisonReportService {
  /**
   * Generate a shareable comparison report ID
   * This can be used to create a unique URL for sharing
   */
  static generateShareableLink(comparisonId: string): string {
    return `${comparisonId}-${Date.now()}`;
  }

  /**
   * Decode shareable link to get comparison ID
   */
  static decodeShareableLink(link: string): string | null {
    const parts = link.split('-');
    if (parts.length >= 2) {
      // Return everything except the last part (timestamp)
      return parts.slice(0, -1).join('-');
    }
    return null;
  }

  /**
   * Generate CSV export of university comparison
   */
  static generateCSVExport(universities: University[], analysis: any): string {
    let csv = 'University Name,Tuition Cost,Ranking,Acceptance Rate,Employment Rate,Starting Salary,Student Satisfaction,Research Score\n';

    universities.forEach((u) => {
      const cost = u.tuitionInternational || u.tuitionOutState || 'N/A';
      const ranking = u.rankings ? (u.rankings as any).usNews || 'N/A' : 'N/A';
      const acceptance = u.acceptanceRate ? (u.acceptanceRate * 100).toFixed(1) + '%' : 'N/A';
      const employment = u.employmentRate ? (u.employmentRate * 100).toFixed(1) + '%' : 'N/A';
      const salary = u.averageStartingSalary || 'N/A';
      const satisfaction = u.studentSatisfactionScore?.toFixed(1) || 'N/A';
      const research = u.researchOutputScore?.toFixed(0) || 'N/A';

      csv += `"${u.name}",${cost},${ranking},${acceptance},${employment},${salary},${satisfaction},${research}\n`;
    });

    return csv;
  }

  /**
   * Generate JSON export of complete analysis
   */
  static generateJSONExport(universities: University[], analysis: any): string {
    const exportData = {
      exportDate: new Date().toISOString(),
      universities: universities.map((u) => ({
        id: u.id,
        name: u.name,
        slug: u.slug,
        tuitionCost: u.tuitionInternational || u.tuitionOutState,
        acceptanceRate: u.acceptanceRate,
        ranking: u.rankings,
        employmentRate: u.employmentRate,
        startingSalary: u.averageStartingSalary,
        studentSatisfaction: u.studentSatisfactionScore,
        researchScore: u.researchOutputScore,
      })),
      analysis: {
        metrics: analysis.metrics,
        recommendations: analysis.recommendations,
        riskAssessments: analysis.riskAssessments,
        trends: analysis.trends,
      },
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Generate HTML report for web viewing or PDF conversion
   */
  static generateHTMLReport(universities: University[], analysis: any): string {
    const insights = ComparativeInsightsService.generateComprehensiveSummary(universities);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>University Comparison Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
      background-color: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 2.5em;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 1.1em;
      opacity: 0.9;
    }
    .section {
      background: white;
      padding: 30px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section h2 {
      color: #667eea;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
      margin-top: 0;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .metric-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #667eea;
    }
    .metric-card h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .metric-card .value {
      font-size: 1.8em;
      font-weight: bold;
      color: #667eea;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    table th {
      background: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #ddd;
    }
    table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    table tr:hover {
      background: #f8f9fa;
    }
    .recommendation {
      background: #f0f4ff;
      padding: 15px;
      border-radius: 6px;
      margin: 10px 0;
      border-left: 4px solid #667eea;
    }
    .recommendation .score {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-weight: bold;
      margin-right: 10px;
    }
    .risk-high {
      color: #dc3545;
    }
    .risk-medium {
      color: #ffc107;
    }
    .risk-low {
      color: #28a745;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 0.9em;
      margin-top: 30px;
    }
    .insights {
      white-space: pre-wrap;
      font-size: 1em;
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>University Comparison Report</h1>
    <p>Comparing ${universities.length} universities</p>
    <p>Generated on ${new Date().toLocaleDateString()}</p>
  </div>

  <div class="section">
    <h2>Overview</h2>
    <p>Universities compared: <strong>${universities.map((u) => u.name).join(', ')}</strong></p>
  </div>

  <div class="section">
    <h2>Key Metrics</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <h3>Average Cost</h3>
        <div class="value">$${Math.round(analysis.metrics.averageCost).toLocaleString()}</div>
        <p>Range: $${Math.round(analysis.metrics.costRange.min).toLocaleString()} - $${Math.round(analysis.metrics.costRange.max).toLocaleString()}</p>
      </div>
      <div class="metric-card">
        <h3>Average Ranking</h3>
        <div class="value">#${Math.round(analysis.metrics.averageRanking)}</div>
        <p>Range: #${Math.round(analysis.metrics.rankingRange.min)} - #${Math.round(analysis.metrics.rankingRange.max)}</p>
      </div>
      <div class="metric-card">
        <h3>Avg Acceptance Rate</h3>
        <div class="value">${(analysis.metrics.averageAcceptanceRate * 100).toFixed(1)}%</div>
      </div>
      <div class="metric-card">
        <h3>Employment Rate</h3>
        <div class="value">${(analysis.metrics.averageEmploymentRate * 100).toFixed(1)}%</div>
      </div>
      <div class="metric-card">
        <h3>Avg Starting Salary</h3>
        <div class="value">$${Math.round(analysis.metrics.averageStartingSalary).toLocaleString()}</div>
      </div>
      <div class="metric-card">
        <h3>Research Score</h3>
        <div class="value">${analysis.metrics.averageResearchScore.toFixed(0)}/100</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Smart Recommendations</h2>
    ${
      Object.entries(analysis.recommendations)
        .filter(([_, rec]: any) => rec)
        .map(
          ([key, rec]: any) => `
      <div class="recommendation">
        <span class="score">${rec.score}</span>
        <strong>${rec.universityName}</strong> - ${key.replace(/([A-Z])/g, ' $1').trim()}
        <p>${rec.reason}</p>
      </div>
    `
        )
        .join('')
    }
  </div>

  <div class="section">
    <h2>Risk Assessment</h2>
    <table>
      <thead>
        <tr>
          <th>University</th>
          <th>Risk Score</th>
          <th>Risk Factors</th>
        </tr>
      </thead>
      <tbody>
        ${analysis.riskAssessments
          .map(
            (risk: any) => `
          <tr>
            <td><strong>${risk.universityName}</strong></td>
            <td>${risk.overallRiskScore}/100</td>
            <td>
              ${risk.riskFactors
                .map(
                  (factor: any) => `
                <span class="risk-${factor.severity}">${factor.factor}</span>
              `
                )
                .join(', ')}
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Comparative Insights</h2>
    <div class="insights">${insights}</div>
  </div>

  <div class="section">
    <h2>University Comparison Table</h2>
    <table>
      <thead>
        <tr>
          <th>University</th>
          <th>Cost</th>
          <th>Ranking</th>
          <th>Acceptance</th>
          <th>Employment</th>
          <th>Starting Salary</th>
        </tr>
      </thead>
      <tbody>
        ${universities
          .map(
            (u) => `
          <tr>
            <td><strong>${u.name}</strong></td>
            <td>$${((u.tuitionInternational || u.tuitionOutState) || 0).toLocaleString()}</td>
            <td>${u.rankings ? (u.rankings as any).usNews || 'N/A' : 'N/A'}</td>
            <td>${u.acceptanceRate ? (u.acceptanceRate * 100).toFixed(1) + '%' : 'N/A'}</td>
            <td>${u.employmentRate ? (u.employmentRate * 100).toFixed(1) + '%' : 'N/A'}</td>
            <td>$${(u.averageStartingSalary || 0).toLocaleString()}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>This report was automatically generated by Academora's advanced comparison analysis engine.</p>
    <p>For more information, visit your saved comparisons.</p>
  </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * Generate email-friendly summary of comparison
   */
  static generateEmailSummary(universities: University[], analysis: any): string {
    let emailBody = `<h2>Your University Comparison Summary</h2>\n`;

    emailBody += `<p>You've compared the following universities:</p>\n<ul>\n`;
    universities.forEach((u) => {
      emailBody += `<li><strong>${u.name}</strong></li>\n`;
    });
    emailBody += `</ul>\n\n`;

    emailBody += `<h3>Key Metrics</h3>\n<ul>\n`;
    emailBody += `<li>Average Cost: $${Math.round(analysis.metrics.averageCost).toLocaleString()}</li>\n`;
    emailBody += `<li>Average Ranking: #${Math.round(analysis.metrics.averageRanking)}</li>\n`;
    emailBody += `<li>Average Employment Rate: ${(analysis.metrics.averageEmploymentRate * 100).toFixed(1)}%</li>\n`;
    emailBody += `</ul>\n\n`;

    emailBody += `<h3>Top Recommendations</h3>\n<ul>\n`;
    if (analysis.recommendations.bestValue) {
      emailBody += `<li><strong>Best Value:</strong> ${analysis.recommendations.bestValue.universityName} - ${analysis.recommendations.bestValue.reason}</li>\n`;
    }
    if (analysis.recommendations.bestCareerOutcomes) {
      emailBody += `<li><strong>Best Career Outcomes:</strong> ${analysis.recommendations.bestCareerOutcomes.universityName}</li>\n`;
    }
    if (analysis.recommendations.mostPrestigious) {
      emailBody += `<li><strong>Most Prestigious:</strong> ${analysis.recommendations.mostPrestigious.universityName}</li>\n`;
    }
    emailBody += `</ul>\n\n`;

    emailBody += `<p><a href="#">View Full Report</a></p>`;

    return emailBody;
  }
}
