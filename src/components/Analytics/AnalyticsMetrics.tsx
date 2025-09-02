
// Icons replaced with emojis
import { formatCurrency, CurrencyCode } from "@/lib/currency";
import { useT } from "@/lib/i18n";
import { useLanguage } from "@/contexts/LanguageContext";

interface AnalyticsMetricsProps {
  revenueGrowth: number;
  avgProjectValue: number;
  completionRate: number;
  userCurrency: CurrencyCode;
}

const AnalyticsMetrics = ({
  revenueGrowth,
  avgProjectValue,
  completionRate,
  userCurrency,
}: AnalyticsMetricsProps) => {
  const t = useT();
  const { language } = useLanguage();

  const metrics = [
    {
      title: t('growthRate'),
      value: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`,
      subtitle: t('compareToLastPeriod'),
      emoji: revenueGrowth >= 0 ? '📈' : '📉',
      iconColor: revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      variant: 'muted' as const,
    },
    {
      title: t('averageProjectValue'),
      value: formatCurrency(avgProjectValue, userCurrency),
      subtitle: t('projects'),
      emoji: '🎯',
      iconColor: 'text-blue-600',
      variant: 'muted' as const,
    },
    {
      title: t('completionRate'),
      value: `${completionRate.toFixed(1)}%`,
      subtitle: t('completedMilestones'),
      emoji: '📅',
      iconColor: 'text-purple-600',
      variant: 'muted' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {metrics.map((metric, index) => (
        <div key={index} className="stat-card">
          <div className="flex items-center space-x-3 rtl:space-x-reverse rtl:flex-row-reverse">
            <div className="metric-icon">
              <span className="text-xl">{metric.emoji}</span>
            </div>
            <div className="min-w-0 flex-1 rtl:text-right">
              <p className="stat-label truncate">{metric.title}</p>
              <p className="stat-number text-lg truncate">{metric.value}</p>
              <p className="text-xs text-secondary truncate">{metric.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsMetrics;
