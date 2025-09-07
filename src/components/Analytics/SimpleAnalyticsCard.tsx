import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import MiniChart from "./MiniChart";

interface SimpleAnalyticsCardProps {
  emoji: string;
  title: string;
  value: string;
  subtitle: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  chart?: {
    data: number[];
    type: 'line' | 'bar' | 'progress';
    color?: string;
  };
}

function SimpleAnalyticsCard({
  emoji,
  title,
  value,
  subtitle,
  trend,
  chart
}: SimpleAnalyticsCardProps) {
  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <Card className="border-0 shadow-none bg-gray-50">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0">
            <span className="text-lg sm:text-2xl">{emoji}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 truncate leading-tight">{title}</p>
            <p className="text-base sm:text-lg font-medium text-gray-900 truncate leading-tight">{value}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 truncate leading-tight">{subtitle}</p>
              {trend && (
                <span className={`text-xs font-medium ${getTrendColor()}`}>
                  {getTrendIcon()} {trend.value}
                </span>
              )}
            </div>
            {chart && (
              <div className="mt-2">
                <MiniChart
                  data={chart.data}
                  type={chart.type}
                  color={chart.color}
                  className="opacity-70"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(SimpleAnalyticsCard);