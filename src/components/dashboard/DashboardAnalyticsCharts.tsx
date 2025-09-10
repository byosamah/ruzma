
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
} from "@/components/ui/chartLazy";
import { formatCurrency, CurrencyCode } from "@/lib/currency";
import { useT } from "@/lib/i18n";

interface AnalyticsData {
  revenueData: Array<{ month: string; revenue: number; projects: number }>;
  milestoneStatusData: Array<{ status: string; count: number; color: string }>;
  monthlyProgress: Array<{ month: string; completed: number; pending: number }>;
}

interface DashboardAnalyticsChartsProps {
  data: AnalyticsData;
  userCurrency: CurrencyCode;
}


const DashboardAnalyticsCharts = ({
  data,
  userCurrency,
}: DashboardAnalyticsChartsProps) => {
  const t = useT();
  
  const chartConfig = {
    revenue: {
      label: t("revenue"),
      color: "hsl(var(--chart-1))",
    },
    projects: {
      label: t("chartProjects"),
      color: "hsl(var(--chart-2))",
    },
    completed: {
      label: t("chartCompleted"),
      color: "hsl(var(--chart-3))",
    },
    pending: {
      label: t("chartPending"),
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('revenueOverTime')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px]">
            <LineChart data={data.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
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
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={{ fill: "var(--color-revenue)" }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestone Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('milestonesStatus')}</CardTitle>
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
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Progress */}
        <Card>
          <CardHeader>
            <CardTitle>{t('projectsOverTime')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px]">
              <BarChart data={data.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" fill="var(--color-completed)" />
                <Bar dataKey="pending" fill="var(--color-pending)" />
                <Legend />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAnalyticsCharts;
