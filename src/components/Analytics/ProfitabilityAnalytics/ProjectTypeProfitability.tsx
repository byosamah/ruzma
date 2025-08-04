import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { ProjectTypeAnalytics } from '@/types/advancedAnalytics';
import { useCategoryTranslator } from '@/hooks/analytics/categoryTranslator';

interface ProjectTypeProfitabilityProps {
  projectTypes: ProjectTypeAnalytics[];
  userCurrency: CurrencyCode;
}

const ProjectTypeProfitability: React.FC<ProjectTypeProfitabilityProps> = ({
  projectTypes,
  userCurrency,
}) => {
  const t = useT();
  const translateCategory = useCategoryTranslator();

  const chartData = projectTypes.slice(0, 8).map(type => ({
    category: translateCategory(type.category).length > 12 ? translateCategory(type.category).substring(0, 12) + '...' : translateCategory(type.category),
    fullCategory: translateCategory(type.category),
    revenue: type.totalRevenue,
    revenuePerDay: type.revenuePerDay,
    completionRate: type.completionRate,
    projectCount: type.projectCount,
  }));

  const chartConfig = {
    revenue: { label: t('chartTotalRevenue'), color: "hsl(var(--chart-1))" },
    revenuePerDay: { label: t('chartRevenuePerDay'), color: "hsl(var(--chart-2))" },
  };

  return (
    <div className="space-y-6">
      {/* Revenue by Project Type Chart */}
      <Card className="card-flat" dir={t('revenueByProjectType') === 'الإيرادات حسب نوع المشروع' ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary flex items-center gap-2 rtl:flex-row-reverse">
            📊 {t('revenueByProjectType')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px]">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                angle={-45}
                textAnchor="end"
                height={60}
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
                        <p className="font-medium">{data.fullCategory}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(data.revenue, userCurrency)} {t('total')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.projectCount} {t('projects')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(data.revenuePerDay, userCurrency)}/{t('day')} {t('avg')}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Project Type Details Table */}
      <Card className="card-flat" dir={t('projectTypePerformance') === 'أداء نوع المشروع' ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary">
            {t('projectTypePerformance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 rtl:space-y-reverse">
            {projectTypes.slice(0, 6).map((type, index) => (
              <div key={type.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 rtl:flex-row-reverse">
                <div className="flex items-center gap-3 min-w-0 flex-1 rtl:flex-row-reverse">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {translateCategory(type.category)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground rtl:flex-row-reverse">
                      <span>{type.projectCount} {t('projects')}</span>
                      <span>{type.completionRate.toFixed(1)}% {t('completed')}</span>
                      <span>{type.clientSatisfactionProxy.toFixed(1)}% {t('repeatRate')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right rtl:text-left">
                  <p className="font-medium text-sm">
                    {formatCurrency(type.totalRevenue, userCurrency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(type.revenuePerDay, userCurrency)}/{t('day')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTypeProfitability;