import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UniversityMatchResult } from '@/hooks/useUniversitySearch';

interface MatchRadarChartProps {
  result: UniversityMatchResult;
}

interface RadarDataPoint {
  category: string;
  score: number;
  fullMark: number;
}

// Custom tooltip for better UX
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as RadarDataPoint;
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-foreground">{data.category}</p>
        <p className="text-sm text-muted-foreground">
          Score: <span className="font-bold text-foreground">{data.score}%</span>
        </p>
      </div>
    );
  }
  return null;
};

/**
 * MatchRadarChart Component
 * Visualizes university match scores across 5 dimensions using a radar/spider chart
 * Provides an at-a-glance view of strengths and weaknesses
 */
export default function MatchRadarChart({ result }: MatchRadarChartProps) {
  // Transform scoreBreakdown into radar chart data
  const data: RadarDataPoint[] = [
    {
      category: 'Academic',
      score: result.scoreBreakdown.academic.score,
      fullMark: 100,
    },
    {
      category: 'Financial',
      score: result.scoreBreakdown.financial.score,
      fullMark: 100,
    },
    {
      category: 'Location',
      score: result.scoreBreakdown.location.score,
      fullMark: 100,
    },
    {
      category: 'Social',
      score: result.scoreBreakdown.social.score,
      fullMark: 100,
    },
    {
      category: 'Future',
      score: result.scoreBreakdown.future.score,
      fullMark: 100,
    },
  ];

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500" />
          Match Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={data}>
            <PolarGrid 
              stroke="hsl(var(--border))" 
              strokeDasharray="3 3"
            />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ 
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 12,
                fontWeight: 500
              }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ 
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 10
              }}
            />
            <Radar 
              name="Match Score" 
              dataKey="score" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary))" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span>Your Match Profile</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
