
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react";
import { formatCurrency, CurrencyCode } from "@/lib/currency";
import { useT } from "@/lib/i18n";

interface AnalyticsMetricsProps {
  revenueGrowth: number;
  avgProjectValue: number;
  completionRate: number;
  userCurrency: CurrencyCode;
}

const AnalyticsMetrics: React.FC<AnalyticsMetricsProps> = ({
  revenueGrowth,
  avgProjectValue,
  completionRate,
  userCurrency,
}) => {
  const t = useT();

  const metrics = [
    {
      title: t('growthRate'),
      value: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`,
      subtitle: t('compareToLastPeriod'),
      icon: revenueGrowth >= 0 ? TrendingUp : TrendingDown,
      iconColor: revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: 'bg-gray-50',
    },
    {
      title: t('averageProjectValue'),
      value: formatCurrency(avgProjectValue, userCurrency),
      subtitle: t('projects'),
      icon: Target,
      iconColor: 'text-blue-600',
      bgColor: 'bg-gray-50',
    },
    {
      title: t('completionRate'),
      value: `${completionRate.toFixed(1)}%`,
      subtitle: t('completedMilestones'),
      icon: Calendar,
      iconColor: 'text-purple-600',
      bgColor: 'bg-gray-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="border-0 shadow-none bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-4 h-4 ${metric.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 truncate">{metric.title}</p>
                  <p className="text-lg font-medium text-gray-900 truncate">{metric.value}</p>
                  <p className="text-xs text-gray-400 truncate">{metric.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AnalyticsMetrics;
