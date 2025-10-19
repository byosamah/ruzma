
import React, { memo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, CurrencyCode } from "@/lib/currency";
import { useT } from "@/lib/i18n";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  totalProjects: number;
  totalEarnings: number;
  completedMilestones: number;
  totalMilestones: number;
  pendingPayments: number;
  userCurrency: CurrencyCode;
}

const DashboardStats = ({
  totalProjects,
  totalEarnings,
  completedMilestones,
  totalMilestones,
  pendingPayments,
  userCurrency,
}: DashboardStatsProps) => {
  const t = useT();
  const { dir } = useLanguage();

  // Calculate completion percentage
  const completionRate = totalMilestones > 0
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 0;

  const stats = [
    {
      title: t("totalProjects"),
      value: totalProjects.toString(),
      subtitle: t("activeProjects"),
      trend: null,
      trendLabel: null,
    },
    {
      title: t("totalEarnings"),
      value: formatCurrency(totalEarnings, userCurrency),
      subtitle: t("fromCompletedMilestones"),
      trend: totalEarnings > 0 ? "up" : null,
      trendLabel: totalEarnings > 0 ? t("dashboard.trending") : null,
    },
    {
      title: t("completed"),
      value: `${completedMilestones}/${totalMilestones}`,
      subtitle: `${completionRate}% ${t("milestonesCompleted")}`,
      trend: completionRate >= 50 ? "up" : completionRate > 0 ? "neutral" : null,
      trendLabel: completionRate >= 50 ? t("dashboard.onTrack") : completionRate > 0 ? t("dashboard.inProgress") : null,
    },
    {
      title: t("pendingPayments"),
      value: pendingPayments.toString(),
      subtitle: t("awaitingApproval"),
      trend: pendingPayments > 0 ? "attention" : null,
      trendLabel: pendingPayments > 0 ? t("dashboard.needsAttention") : null,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        return (
          <Card key={index} className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              {stat.trend && (
                <div className={cn(
                  "text-xs font-medium",
                  stat.trend === "up" && "text-green-600",
                  stat.trend === "neutral" && "text-blue-600",
                  stat.trend === "attention" && "text-amber-600"
                )}>
                  {stat.trend === "up" && <span className={cn("inline-block", dir === 'rtl' ? "rotate-180" : "")}>↑</span>}
                  {stat.trend === "neutral" && "→"}
                  {stat.trend === "attention" && "⚠"}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={cn(
                "text-xs mt-1",
                stat.trend === "up" && "text-green-600",
                stat.trend === "neutral" && "text-blue-600",
                stat.trend === "attention" && "text-amber-600",
                !stat.trend && "text-muted-foreground"
              )}>
                {stat.trendLabel || stat.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default memo(DashboardStats);
