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

  return (
    <Card className="card-flat">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-primary flex items-center gap-2">
          👑 Top Clients by Lifetime Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topClients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No client data available yet
            </p>
          ) : (
            topClients.map((client, index) => (
              <div key={client.clientId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {client.clientName}
                      </p>
                      <span className="text-sm">
                        {getTrendEmoji(client.growthTrend)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{client.totalProjects} projects</span>
                      <span className={getRiskColor(client.riskLevel)}>
                        {client.riskLevel} risk
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {formatCurrency(client.lifetimeValue, userCurrency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(client.avgProjectValue, userCurrency)} avg
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