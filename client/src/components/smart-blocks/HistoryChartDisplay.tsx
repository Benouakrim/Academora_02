import React, { useMemo } from 'react';
import { Activity, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useUniversityHistory, type MetricHistoryRecord } from '@/hooks/useUniversityHistory';
import type { HistoricalTrendsBlock } from '@/../../shared/types/microContentBlocks';

interface HistoryChartDisplayProps {
  block: HistoricalTrendsBlock;
  universityId: string;
  userProfile?: Record<string, string | number | boolean | null | undefined>;
}

/**
 * Mapping of metric names to display labels and formatting functions.
 */
const metricConfig: Record<
  string,
  {
    label: string;
    unit: string;
    format: (value: number | null) => string;
    color: string;
  }
> = {
  acceptanceRate: {
    label: 'Acceptance Rate',
    unit: '%',
    format: (val) => (val !== null ? `${(val * 100).toFixed(1)}%` : 'N/A'),
    color: '#3b82f6',
  },
  tuitionCost: {
    label: 'Tuition Cost',
    unit: '$',
    format: (val) => (val !== null ? `$${(val / 1000).toFixed(0)}k` : 'N/A'),
    color: '#ef4444',
  },
  ranking: {
    label: 'Ranking',
    unit: '#',
    format: (val) => (val !== null ? `#${Math.round(val)}` : 'N/A'),
    color: '#8b5cf6',
  },
  employmentRate: {
    label: 'Employment Rate',
    unit: '%',
    format: (val) => (val !== null ? `${(val * 100).toFixed(1)}%` : 'N/A'),
    color: '#10b981',
  },
  avgSalary: {
    label: 'Average Starting Salary',
    unit: '$',
    format: (val) => (val !== null ? `$${(val / 1000).toFixed(0)}k` : 'N/A'),
    color: '#f59e0b',
  },
  graduationRate: {
    label: 'Graduation Rate',
    unit: '%',
    format: (val) => (val !== null ? `${(val * 100).toFixed(1)}%` : 'N/A'),
    color: '#06b6d4',
  },
  retentionRate: {
    label: 'Retention Rate',
    unit: '%',
    format: (val) => (val !== null ? `${(val * 100).toFixed(1)}%` : 'N/A'),
    color: '#ec4899',
  },
};

/**
 * HistoryChartDisplay Component
 * 
 * Renders historical trends for university metrics over time.
 * 
 * Features:
 * - Fetches data from the API via useUniversityHistory hook
 * - Handles loading and error states
 * - Renders data in a table format (simple, accessible)
 * - Placeholder for actual charting library integration (Recharts, Chart.js, etc.)
 * - Optional user comparison overlay
 * 
 * @param block - Configuration from the HistoricalTrendsBlock
 * @param universityId - The university UUID
 * @param userProfile - Optional user profile data for comparisons
 */
const HistoryChartDisplay: React.FC<HistoryChartDisplayProps> = ({
  block,
  universityId,
  userProfile = {},
}) => {
  const { metric, displayYears, chartStyle, showUserComparison, showLegend, showGridLines } =
    block.data;

  // Fetch historical data
  const { data: historyData = [], isLoading, isError } = useUniversityHistory(
    universityId,
    displayYears
  );

  // Determine user target value based on metric if comparison is enabled
  const userTargetValue = useMemo(() => {
    if (!showUserComparison) return undefined;

    switch (metric) {
      case 'tuitionCost':
        // Assumes maxBudget is stored in userProfile (from Financial Profile)
        return userProfile?.maxBudget as number | undefined;
      case 'acceptanceRate':
        // Could use target acceptance rate if stored in user profile
        return userProfile?.targetAcceptanceRate as number | undefined;
      case 'ranking':
        // Could use target ranking if stored in user profile
        return userProfile?.targetRanking as number | undefined;
      default:
        return undefined;
    }
  }, [showUserComparison, metric, userProfile]);

  // Config for the current metric
  const config = metricConfig[metric] || metricConfig.acceptanceRate;

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            <p className="text-gray-600">Loading historical data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error or no data state
  if (isError || historyData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3 text-yellow-600">
            <AlertCircle className="h-5 w-5" />
            <p>No historical data available for the last {displayYears} years.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const values = historyData
    .map((record) => record[metric as keyof MetricHistoryRecord] as number | null)
    .filter((v) => v !== null) as number[];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const current = values[values.length - 1];
  const trend = values.length > 1 ? current - values[0] : 0;
  const trendPercent = values.length > 1 ? ((trend / values[0]) * 100).toFixed(1) : '0.0';

  return (
    <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          {config.label} Trend
          <span className="text-sm font-normal text-gray-600">
            ({historyData[0]?.year} - {historyData[historyData.length - 1]?.year})
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Statistics Summary */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs font-medium text-gray-600">Current</p>
            <p className="mt-1 text-lg font-bold text-blue-600">
              {config.format(current)}
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3">
            <p className="text-xs font-medium text-gray-600">Trend</p>
            <p className="mt-1 flex items-center gap-1 text-lg font-bold text-purple-600">
              <TrendingUp className="h-4 w-4" />
              {trendPercent}%
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-xs font-medium text-gray-600">Min</p>
            <p className="mt-1 text-lg font-bold text-green-600">
              {config.format(min)}
            </p>
          </div>
          <div className="rounded-lg bg-orange-50 p-3">
            <p className="text-xs font-medium text-gray-600">Max</p>
            <p className="mt-1 text-lg font-bold text-orange-600">
              {config.format(max)}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Year</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-700">
                  {config.label}
                </th>
                {showUserComparison && userTargetValue !== undefined && (
                  <th className="px-4 py-2 text-right font-semibold text-gray-700">
                    vs. Your Target
                  </th>
                )}
                <th className="px-4 py-2 text-right font-semibold text-gray-700">Change</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((record, idx) => {
                const value = record[metric as keyof MetricHistoryRecord] as number | null;
                const prevValue =
                  idx > 0
                    ? (historyData[idx - 1][metric as keyof MetricHistoryRecord] as
                        | number
                        | null)
                    : null;
                const yearChange = prevValue !== null && value !== null ? value - prevValue : null;

                return (
                  <tr
                    key={record.year}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{record.year}</td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: config.color }}>
                      {config.format(value)}
                    </td>
                    {showUserComparison && userTargetValue !== undefined && (
                      <td className="px-4 py-3 text-right text-sm">
                        {value !== null ? (
                          <span
                            className={
                              metric === 'ranking'
                                ? value <= userTargetValue
                                  ? 'text-green-600 font-semibold'
                                  : 'text-orange-600'
                                : value >= userTargetValue
                                  ? 'text-green-600 font-semibold'
                                  : 'text-orange-600'
                            }
                          >
                            {metric === 'ranking' ? (value <= userTargetValue ? '✓' : '↗') : value >= userTargetValue ? '✓' : '↗'}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {yearChange !== null ? (
                        <span className={yearChange > 0 ? 'text-green-600' : 'text-red-600'}>
                          {yearChange > 0 ? '+' : ''}{config.format(yearChange)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Placeholder for Charting Library */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-600">
            📊 {chartStyle.toUpperCase()} Chart Visualization
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Ready for Recharts, Chart.js, or similar library integration
          </p>
          {showLegend && (
            <p className="mt-2 text-xs text-gray-500">
              ✓ Legend enabled | {showGridLines ? '✓ Grid lines enabled' : '✗ Grid lines disabled'}
            </p>
          )}
        </div>

        {/* User Comparison Info */}
        {showUserComparison && userTargetValue !== undefined && (
          <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Comparing to your target: {config.format(userTargetValue)}
            </p>
            <p className="mt-1 text-xs text-amber-700">
              ✓ = University meets or exceeds your target | ↗ = University is below your target
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryChartDisplay;
