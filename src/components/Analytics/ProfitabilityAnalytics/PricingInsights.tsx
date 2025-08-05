import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

interface PricingTrend {
  month: string;
  avgPrice: number;
  projectCount: number;
}

interface RevenueOptimization {
  currentAvgRate: number;
  suggestedRate: number;
  potentialIncrease: number;
}

interface PricingInsightsProps {
  pricingTrends: PricingTrend[];
  revenueOptimization: RevenueOptimization;
  userCurrency: CurrencyCode;
}

const PricingInsights: React.FC<PricingInsightsProps> = ({
  pricingTrends,
  revenueOptimization,
  userCurrency,
}) => {
  const t = useT();
  const { language } = useLanguage();

  const chartConfig = {
    avgPrice: { label: t('averageProjectValue'), color: "hsl(var(--chart-1))" },
  };

  return (
    <div className="space-y-6">
      {/* Pricing Trends Chart */}
      <Card className="card-flat" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary flex items-center gap-2 rtl:flex-row-reverse">
            📈 {t('pricingTrends')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[250px]">
            <LineChart data={pricingTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('avg')}: {formatCurrency(data.avgPrice, userCurrency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.projectCount} {t('projects')}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="avgPrice"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#3b82f6" }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Revenue Optimization */}
      <Card className="card-flat" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary flex items-center gap-2 rtl:flex-row-reverse">
            🎯 {t('revenueOptimization')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-xl font-bold text-primary">
                {formatCurrency(revenueOptimization.currentAvgRate, userCurrency)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t('currentAverageRate')}
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(revenueOptimization.suggestedRate, userCurrency)}
              </div>
              <div className="text-sm text-green-700 mt-1">
                {t('suggestedRate')}
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-xl font-bold text-blue-600">
                +{revenueOptimization.potentialIncrease.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {t('potentialIncrease')}
              </div>
            </div>
          </div>

          {revenueOptimization.potentialIncrease > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 mb-2 rtl:flex-row-reverse">
                <span>💡</span>
                <span className="font-medium text-sm">{t('pricingRecommendation')}</span>
              </div>
              <p className="text-sm text-blue-600">
                {t('basedOnYourPerformance')}{' '}
                <strong>{revenueOptimization.potentialIncrease.toFixed(1)}%</strong>{' '}
                {t('toPerProject')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingInsights;