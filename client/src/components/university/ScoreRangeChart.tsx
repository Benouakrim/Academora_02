import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScoreRangeChartProps {
  satMath25?: number | null;
  satMath75?: number | null;
  satVerbal25?: number | null;
  satVerbal75?: number | null;
  actComposite25?: number | null;
  actComposite75?: number | null;
}

export default function ScoreRangeChart({
  satMath25,
  satMath75,
  satVerbal25,
  satVerbal75,
  actComposite25,
  actComposite75,
}: ScoreRangeChartProps) {
  // Prepare data for SAT ranges
  const satData = [];
  if (satMath25 && satMath75) {
    satData.push({
      name: 'SAT Math',
      '25th %ile': satMath25,
      range: satMath75 - satMath25,
      '75th %ile': satMath75,
    });
  }
  if (satVerbal25 && satVerbal75) {
    satData.push({
      name: 'SAT Verbal',
      '25th %ile': satVerbal25,
      range: satVerbal75 - satVerbal25,
      '75th %ile': satVerbal75,
    });
  }

  // Prepare data for ACT range
  const actData = [];
  if (actComposite25 && actComposite75) {
    actData.push({
      name: 'ACT Composite',
      '25th %ile': actComposite25,
      range: actComposite75 - actComposite25,
      '75th %ile': actComposite75,
    });
  }

  const hasSATData = satData.length > 0;
  const hasACTData = actData.length > 0;

  if (!hasSATData && !hasACTData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {hasSATData && (
        <Card>
          <CardHeader>
            <CardTitle>SAT Score Ranges (25th - 75th Percentile)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={satData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 800]} className="text-xs" />
                <YAxis dataKey="name" type="category" width={100} className="text-sm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Bar dataKey="25th %ile" stackId="a" fill="hsl(var(--muted))" />
                <Bar dataKey="range" stackId="a" radius={[0, 8, 8, 0]}>
                  {satData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === 'SAT Math'
                          ? 'hsl(var(--primary))'
                          : 'hsl(var(--chart-2))'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {satData.map((item) => (
                <div key={item.name} className="flex justify-between">
                  <span>{item.name}:</span>
                  <span className="font-medium text-foreground">
                    {item['25th %ile']} - {item['75th %ile']}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hasACTData && (
        <Card>
          <CardHeader>
            <CardTitle>ACT Score Range (25th - 75th Percentile)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart
                data={actData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 36]} className="text-xs" />
                <YAxis dataKey="name" type="category" width={120} className="text-sm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Bar dataKey="25th %ile" stackId="a" fill="hsl(var(--muted))" />
                <Bar
                  dataKey="range"
                  stackId="a"
                  fill="hsl(var(--chart-3))"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>ACT Composite:</span>
                <span className="font-medium text-foreground">
                  {actData[0]['25th %ile']} - {actData[0]['75th %ile']}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
