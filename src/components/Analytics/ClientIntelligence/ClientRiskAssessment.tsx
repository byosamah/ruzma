import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

interface RiskAssessment {
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

interface ClientRiskAssessmentProps {
  riskAssessment: RiskAssessment;
  clientRetentionRate: number;
  averageClientLifetime: number;
}

const ClientRiskAssessment = ({
  riskAssessment,
  clientRetentionRate,
  averageClientLifetime,
}: ClientRiskAssessmentProps) => {
  const t = useT();
  const { language } = useLanguage();

  const totalClients = riskAssessment.highRisk + riskAssessment.mediumRisk + riskAssessment.lowRisk;

  const riskMetrics = [
    {
      label: t('highRisk'),
      value: riskAssessment.highRisk,
      percentage: totalClients > 0 ? (riskAssessment.highRisk / totalClients) * 100 : 0,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      emoji: '🚨',
    },
    {
      label: t('mediumRisk'),
      value: riskAssessment.mediumRisk,
      percentage: totalClients > 0 ? (riskAssessment.mediumRisk / totalClients) * 100 : 0,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      emoji: '⚠️',
    },
    {
      label: t('lowRisk'),
      value: riskAssessment.lowRisk,
      percentage: totalClients > 0 ? (riskAssessment.lowRisk / totalClients) * 100 : 0,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      emoji: '✅',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Risk Distribution */}
      <Card className="card-flat" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary flex items-center gap-2 rtl:flex-row-reverse">
            🎯 {t('clientRiskAssessment')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 rtl:space-y-reverse">
            {riskMetrics.map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between rtl:flex-row-reverse">
                  <div className="flex items-center gap-2 rtl:flex-row-reverse">
                    <span className="text-sm">{metric.emoji}</span>
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className={`text-sm font-medium ${metric.textColor}`}>
                    {metric.value} ({metric.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${metric.color}`}
                    style={{ width: `${metric.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card className="card-flat" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary">
            {t('relationshipMetrics')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 rtl:space-y-reverse">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-primary">
                {clientRetentionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t('clientRetentionRate')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {t('clientsWithMultipleProjects')}
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-primary">
                {averageClientLifetime.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t('averageClientLifetime')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {t('monthsOfCollaboration')}
              </div>
            </div>

            {riskAssessment.highRisk > 0 && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-red-700 rtl:flex-row-reverse">
                  <span>⚠️</span>
                  <span className="text-sm font-medium">{t('actionRequired')}</span>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  {t('youHave')} {riskAssessment.highRisk} {riskAssessment.highRisk !== 1 ? t('highRiskClientsMessage') : t('highRiskClientMessage')} {t('thatMayNeedAttention')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientRiskAssessment;