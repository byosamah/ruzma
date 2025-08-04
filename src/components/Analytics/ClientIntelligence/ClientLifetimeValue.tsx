import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { ClientAnalytics } from '@/types/advancedAnalytics';

interface ClientLifetimeValueProps {
  clients: ClientAnalytics[];
  userCurrency: CurrencyCode;
}

const ClientLifetimeValue: React.FC<ClientLifetimeValueProps> = ({
  clients,
  userCurrency,
}) => {
  const t = useT();
  
  const topClients = clients.slice(0, 5);

  const getTrendEmoji = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const translateRiskLevel = (risk: string) => {
    switch (risk) {
      case 'high': return t('highRisk');
      case 'medium': return t('mediumRisk');
      case 'low': return t('lowRisk');
      default: return risk;
    }
  };

  return (
    <Card className="card-flat" dir={t('topClientsByLifetimeValue') === 'أفضل العملاء حسب القيمة الإجمالية' ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-primary flex items-center gap-2 rtl:flex-row-reverse">
          👑 {t('topClientsByLifetimeValue')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 rtl:space-y-reverse">
          {topClients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('noClientDataAvailable')}
            </p>
          ) : (
            topClients.map((client, index) => (
              <div key={client.clientId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 rtl:flex-row-reverse">
                <div className="flex items-center gap-3 min-w-0 flex-1 rtl:flex-row-reverse">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 rtl:flex-row-reverse">
                      <p className="font-medium text-sm truncate">
                        {client.clientName}
                      </p>
                      <span className="text-sm">
                        {getTrendEmoji(client.growthTrend)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground rtl:flex-row-reverse">
                      <span>{client.totalProjects} {t('projects')}</span>
                       <span className={getRiskColor(client.riskLevel)}>
                         {translateRiskLevel(client.riskLevel)} {t('risk')}
                       </span>
                    </div>
                  </div>
                </div>
                <div className="text-right rtl:text-left">
                  <p className="font-medium text-sm">
                    {formatCurrency(client.lifetimeValue, userCurrency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(client.avgProjectValue, userCurrency)} {t('avg')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientLifetimeValue;