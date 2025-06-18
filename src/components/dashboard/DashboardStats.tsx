
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      <Card className="bg-secondary text-secondary-foreground">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t("totalProjects")}
          </CardTitle>
          <Briefcase className="w-4 h-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProjects}</div>
          <p className="text-xs">{t("activeProjects")}</p>
        </CardContent>
      </Card>

      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t("totalEarnings")}
          </CardTitle>
          <DollarSign className="w-4 h-4" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold break-words">
            {formatCurrency(totalEarnings, userCurrency)}
          </div>
          <p className="text-xs">{t("fromCompletedMilestones")}</p>
        </CardContent>
      </Card>

      <Card className="bg-accent text-accent-foreground">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t("pendingPayments")}
          </CardTitle>
          <Clock className="w-4 h-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingPayments}</div>
          <p className="text-xs">{t("awaitingApproval")}</p>
        </CardContent>
      </Card>

      <Card className="bg-secondary text-secondary-foreground">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t("completed")}
          </CardTitle>
          <CheckCircle className="w-4 h-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {completedMilestones}/{totalMilestones}
          </div>
          <p className="text-xs">{t("milestonesCompleted")}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
