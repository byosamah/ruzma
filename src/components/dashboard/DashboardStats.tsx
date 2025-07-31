
import React, { memo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
// Replaced icons with emojis
import { formatCurrency, CurrencyCode } from "@/lib/currency";
import { useT } from "@/lib/i18n";

interface DashboardStatsProps {
  totalProjects: number;
  totalEarnings: number;
  completedMilestones: number;
  totalMilestones: number;
  pendingPayments: number;
  userCurrency: CurrencyCode;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalProjects,
  totalEarnings,
  completedMilestones,
  totalMilestones,
  pendingPayments,
  userCurrency,
}) => {
  const t = useT();

  const stats = [
    {
      title: t("totalProjects"),
      value: totalProjects.toString(),
      subtitle: t("activeProjects"),
      emoji: '💼',
    },
    {
      title: t("totalEarnings"),
      value: formatCurrency(totalEarnings, userCurrency),
      subtitle: t("fromCompletedMilestones"),
      emoji: '💰',
    },
    {
      title: t("pendingPayments"),
      value: pendingPayments.toString(),
      subtitle: t("awaitingApproval"),
      emoji: '⏰',
    },
    {
      title: t("completed"),
      value: `${completedMilestones}/${totalMilestones}`,
      subtitle: t("milestonesCompleted"),
      emoji: '✅',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        return (
          <Card key={index} className="border-0 shadow-none bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg">
                  <span className="text-2xl">{stat.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 truncate">{stat.title}</p>
                  <p className="text-lg font-medium text-gray-900 truncate">{stat.value}</p>
                  <p className="text-xs text-gray-400 truncate">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default memo(DashboardStats);
