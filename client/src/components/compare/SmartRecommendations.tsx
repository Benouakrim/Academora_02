import { AlertCircle, TrendingUp, Award, DollarSign, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SmartRecommendation } from '@/hooks/useCompare';

interface SmartRecommendationsProps {
  recommendations: {
    bestValue?: SmartRecommendation;
    mostPrestigious?: SmartRecommendation;
    mostAffordable?: SmartRecommendation;
    bestForInternational?: SmartRecommendation;
  };
  onSelectUniversity?: (universityId: string) => void;
}

export function SmartRecommendations({ recommendations, onSelectUniversity }: SmartRecommendationsProps) {
  const cards = [
    {
      key: 'bestValue',
      recommendation: recommendations.bestValue,
      icon: TrendingUp,
      title: 'Best Value',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      key: 'mostPrestigious',
      recommendation: recommendations.mostPrestigious,
      icon: Award,
      title: 'Most Prestigious',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    {
      key: 'mostAffordable',
      recommendation: recommendations.mostAffordable,
      icon: DollarSign,
      title: 'Most Affordable',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      key: 'bestForInternational',
      recommendation: recommendations.bestForInternational,
      icon: Globe,
      title: 'Best for International',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
  ].filter(card => card.recommendation);

  if (cards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Smart Recommendations
          </CardTitle>
          <CardDescription>
            Not enough data to generate recommendations for these universities.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">🎯 Smart Recommendations</h3>
        <p className="text-sm text-muted-foreground">
          AI-powered insights to help you make the best decision
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ key, recommendation, icon: Icon, title, color, bgColor }) => (
          <Card
            key={key}
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onSelectUniversity?.(recommendation!.universityId)}
          >
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center mb-3`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                {recommendation!.universityName}
              </h4>
              <Badge variant="secondary" className="text-xs">
                Score: {recommendation!.score}/100
              </Badge>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {recommendation!.reason}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
