
import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Briefcase, DollarSign, Clock, CheckCircle } from "lucide-react";
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
      icon: Briefcase,
      iconColor: 'text-blue-600',
    },
    {
      title: t("totalEarnings"),
      value: formatCurrency(totalEarnings, userCurrency),
      subtitle: t("fromCompletedMilestones"),
      icon: DollarSign,
      iconColor: 'text-green-600',
    },
    {
      title: t("pendingPayments"),
      value: pendingPayments.toString(),
      subtitle: t("awaitingApproval"),
      icon: Clock,
      iconColor: 'text-amber-600',
    },
    {
      title: t("completed"),
      value: `${completedMilestones}/${totalMilestones}`,
      subtitle: t("milestonesCompleted"),
      icon: CheckCircle,
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-none bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white">
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} />
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

export default DashboardStats;
