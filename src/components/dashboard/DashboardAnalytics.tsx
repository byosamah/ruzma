
import React from "react";
import { CurrencyCode } from "@/lib/currency";
import DashboardAnalyticsMetrics from "./DashboardAnalyticsMetrics";
import DashboardAnalyticsCharts from "./DashboardAnalyticsCharts";

interface AnalyticsData {
  revenueData: Array<{ month: string; revenue: number; projects: number }>;
  milestoneStatusData: Array<{ status: string; count: number; color: string }>;
  monthlyProgress: Array<{ month: string; completed: number; pending: number }>;
  revenueGrowth: number;
  avgProjectValue: number;
  completionRate: number;
}

interface DashboardAnalyticsProps {
  data: AnalyticsData;
  userCurrency: CurrencyCode;
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  data,
  userCurrency,
}) => {
  return (
    <div className="space-y-6">
      <DashboardAnalyticsMetrics
        revenueGrowth={data.revenueGrowth}
        avgProjectValue={data.avgProjectValue}
        completionRate={data.completionRate}
        userCurrency={userCurrency}
      />
      
      <DashboardAnalyticsCharts
        data={data}
        userCurrency={userCurrency}
      />
    </div>
  );
};

export default DashboardAnalytics;
