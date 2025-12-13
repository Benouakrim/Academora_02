// client/src/components/smart-blocks/KeyStatDisplay.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, LayoutPanelTop } from 'lucide-react';

interface KeyStatDisplayProps {
  value: number | string;
  unit?: string;
  label: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <LayoutPanelTop className="h-4 w-4 text-gray-500" />;
};

export default function KeyStatDisplay({
  value,
  unit,
  label,
  description,
  trend,
  trendValue,
}: KeyStatDisplayProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {trend && <TrendIcon trend={trend} />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {value}
          {unit && <span className="text-xl font-normal text-gray-500 ml-1">{unit}</span>}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {trendValue && (
          <p
            className={`text-xs mt-2 ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
