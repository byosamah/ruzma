
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Replaced icons with emojis
import { formatCurrency, CurrencyCode } from "@/lib/currency";
import { useT } from "@/lib/i18n";

interface DashboardAnalyticsMetricsProps {
  revenueGrowth: number;
  avgProjectValue: number;
  completionRate: number;
  userCurrency: CurrencyCode;
}

const DashboardAnalyticsMetrics = ({
  revenueGrowth,
  avgProjectValue,
  completionRate,
  userCurrency,
}: DashboardAnalyticsMetricsProps) => {
  const t = useT();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('growthRate')}</CardTitle>
          <span className="text-2xl">
            {revenueGrowth >= 0 ? '📈' : '📉'}
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {revenueGrowth >= 0 ? "+" : ""}
            {revenueGrowth.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">{t('compareToLastPeriod')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('averageProjectValue')}</CardTitle>
          <span className="text-2xl">🎯</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(avgProjectValue, userCurrency)}
          </div>
          <p className="text-xs text-muted-foreground">{t('projects')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('completionRate')}</CardTitle>
          <span className="text-2xl">📅</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">{t('completedMilestones')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAnalyticsMetrics;
