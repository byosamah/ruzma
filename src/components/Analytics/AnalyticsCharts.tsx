
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

interface AnalyticsData {
  revenueData: Array<{ month: string; revenue: number; projects: number }>;
  milestoneStatusData: Array<{ status: string; count: number; color: string }>;
  monthlyProgress: Array<{ month: string; completed: number; pending: number }>;
}

interface AnalyticsChartsProps {
  data: AnalyticsData;
  userCurrency: CurrencyCode;
}

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  projects: { label: "Projects", color: "hsl(var(--chart-2))" },
  completed: { label: "Completed", color: "hsl(var(--chart-3))" },
  pending: { label: "Pending", color: "hsl(var(--chart-4))" },
};

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data, userCurrency }) => {
  const t = useT();

  return (
    <div className="space-y-6">
      {/* Revenue Trend Chart */}
      <Card className="border-0 shadow-none bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-gray-900">
            {t('revenueOverTime')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px]">
            <LineChart data={data.revenueData}>
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
                dot={{ fill: "#1f2937", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#1f2937" }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestone Status Distribution */}
        <Card className="border-0 shadow-none bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">
              {t('milestonesStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px]">
              <PieChart>
                <Pie
                  data={data.milestoneStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="count"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {data.milestoneStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Progress */}
        <Card className="border-0 shadow-none bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">
              {t('projectsOverTime')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px]">
              <BarChart data={data.monthlyProgress}>
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
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
