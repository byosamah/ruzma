
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCurrency, CurrencyCode } from "@/lib/currency";
import { useT } from "@/lib/i18n";
import { useLanguage } from "@/contexts/LanguageContext";

interface AnalyticsData {
  revenueData: Array<{ month: string; revenue: number; projects: number }>;
  milestoneStatusData: Array<{ status: string; count: number; color: string }>;
  monthlyProgress: Array<{ month: string; completed: number; pending: number }>;
}

interface AnalyticsChartsProps {
  data: AnalyticsData;
  userCurrency: CurrencyCode;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data, userCurrency }) => {
  const t = useT();
  const { language } = useLanguage();

  const chartConfig = {
    revenue: { label: t('revenue'), color: "hsl(var(--chart-1))" },
    projects: { label: t('chartProjects'), color: "hsl(var(--chart-2))" },
    completed: { label: t('chartCompleted'), color: "hsl(var(--chart-3))" },
    pending: { label: t('chartPending'), color: "hsl(var(--chart-4))" },
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Revenue Trend Chart */}
      <Card className="card-flat" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-medium text-primary flex items-center gap-2 rtl:flex-row-reverse rtl:text-right">
            📈 {t('revenueOverTime')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <ChartContainer config={chartConfig} className="min-h-[250px] sm:min-h-[300px]">
            <LineChart data={data.revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                width={60}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      name === "revenue"
                        ? formatCurrency(Number(value), userCurrency)
                        : value,
                      name === "revenue" ? t('totalRevenue') : t('projects'),
                    ]}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1f2937"
                strokeWidth={2}
                dot={{ fill: "#1f2937", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: "#1f2937" }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Milestone Status Distribution */}
        <Card className="card-flat" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-medium text-primary flex items-center gap-2 rtl:flex-row-reverse rtl:text-right">
              🎯 {t('milestonesStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <ChartContainer config={chartConfig} className="min-h-[220px] sm:min-h-[250px]">
              <PieChart>
                <Pie
                  data={data.milestoneStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="count"
                  label={false}
                >
                  {data.milestoneStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                  iconType="circle"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Progress */}
        <Card className="card-flat" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-medium text-primary flex items-center gap-2 rtl:flex-row-reverse rtl:text-right">
              📊 {t('projectsOverTime')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <ChartContainer config={chartConfig} className="min-h-[220px] sm:min-h-[250px]">
              <BarChart data={data.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
