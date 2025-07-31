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

  // Function to translate metric names
  const translateMetric = (metric: string) => {
    const translations: Record<string, string> = {
      'Average Project Value': t('averageProjectValue'),
      'Client Retention Rate': t('clientRetentionRate'),
      'Project Completion Rate': t('projectCompletionRate'),
      'Revenue Growth Rate': t('revenueGrowthRate'),
      'Profit Margin': t('profitMargin'),
      'Monthly Revenue': t('monthlyRevenue'),
      'Client Acquisition Rate': t('clientAcquisitionRate'),
    };
    return translations[metric] || metric;
  };

  // Function to translate time periods
  const translatePeriod = (period: string) => {
    const translations: Record<string, string> = {
      'This Month': t('thisMonth'),
      'Last Month': t('lastMonth'),
      'This Year': t('thisYear'),
      'This Week': t('thisWeek'),
      'Last Week': t('lastWeek'),
      'This Quarter': t('thisQuarter'),
      'Last Quarter': t('lastQuarter'),
    };
    return translations[period] || period;
  };

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
      title: t('focusOnHighValueProjects'),
      description: t('focusOnHighValueProjectsDesc'),
      emoji: '🎯',
      actionable: true,
    },
    {
      title: t('improveClientRetention'),
      description: t('improveClientRetentionDesc'),
      emoji: '🤝',
      actionable: true,
    },
    {
      title: t('optimizeProjectTimelines'),
      description: t('optimizeProjectTimelinesDesc'),
      emoji: '⏱️',
      actionable: true,
    },
    {
      title: t('considerPremiumPositioning'),
      description: t('considerPremiumPositioningDesc'),
      emoji: '⭐',
      actionable: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profitability Metrics */}
      <Card className="card-flat" dir={t('profitabilityMetrics') === 'مقاييس الربحية' ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary flex items-center gap-2 rtl:flex-row-reverse">
            📊 {t('profitabilityMetrics')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 rtl:space-y-reverse">
            {profitabilityMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 rtl:flex-row-reverse">
                <div className="flex items-center gap-3 rtl:flex-row-reverse">
                  <span className="text-lg">
                    {getTrendEmoji(metric.trend)}
                  </span>
                  <div>
                    <p className="font-medium text-sm" dir={t('profitabilityMetrics') === 'مقاييس الربحية' ? 'rtl' : 'ltr'}>
                      {translateMetric(metric.metric)}
                    </p>
                    <p className="text-xs text-muted-foreground" dir={t('profitabilityMetrics') === 'مقاييس الربحية' ? 'rtl' : 'ltr'}>
                      {translatePeriod(metric.period)}
                    </p>
                  </div>
                </div>
                <div className="text-right rtl:text-left">
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
      <Card className="card-flat" dir={t('growthRecommendations') === 'توصيات النمو' ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary flex items-center gap-2 rtl:flex-row-reverse">
            💡 {t('growthRecommendations')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 rtl:space-y-reverse">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-start gap-3 rtl:flex-row-reverse">
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
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded rtl:text-right">
                          {t('actionable')}
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