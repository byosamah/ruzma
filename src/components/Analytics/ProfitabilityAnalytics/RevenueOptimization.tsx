import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { ProfitabilityMetric } from '@/types/advancedAnalytics';

interface RevenueOptimizationProps {
  profitabilityMetrics: ProfitabilityMetric[];
  userCurrency: CurrencyCode;
}

const RevenueOptimization: React.FC<RevenueOptimizationProps> = ({
  profitabilityMetrics,
  userCurrency,
}) => {
  const t = useT();

  const getTrendEmoji = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const recommendations = [
    {
      title: 'Focus on High-Value Project Types',
      description: 'Prioritize project categories with the highest revenue per day to maximize your earnings.',
      emoji: '🎯',
      actionable: true,
    },
    {
      title: 'Improve Client Retention',
      description: 'Clients with multiple projects tend to pay better rates and provide more stable income.',
      emoji: '🤝',
      actionable: true,
    },
    {
      title: 'Optimize Project Timelines',
      description: 'Shorter delivery times while maintaining quality can increase your effective hourly rate.',
      emoji: '⏱️',
      actionable: true,
    },
    {
      title: 'Consider Premium Positioning',
      description: 'Your completion rates suggest you could command higher rates for your expertise.',
      emoji: '⭐',
      actionable: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profitability Metrics */}
      <Card className="card-flat">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary flex items-center gap-2">
            📊 Profitability Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profitabilityMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {getTrendEmoji(metric.trend)}
                  </span>
                  <div>
                    <p className="font-medium text-sm">
                      {metric.metric}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {metric.period}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium text-sm ${getTrendColor(metric.trend)}`}>
                    {metric.value.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actionable Recommendations */}
      <Card className="card-flat">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary flex items-center gap-2">
            💡 Growth Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {rec.emoji}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-primary mb-1">
                      {rec.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {rec.description}
                    </p>
                    {rec.actionable && (
                      <div className="mt-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Actionable
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueOptimization;