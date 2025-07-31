import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/lib/i18n';

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

const ClientRiskAssessment: React.FC<ClientRiskAssessmentProps> = ({
  riskAssessment,
  clientRetentionRate,
  averageClientLifetime,
}) => {
  const t = useT();

  const totalClients = riskAssessment.highRisk + riskAssessment.mediumRisk + riskAssessment.lowRisk;

  const riskMetrics = [
    {
      label: 'High Risk',
      value: riskAssessment.highRisk,
      percentage: totalClients > 0 ? (riskAssessment.highRisk / totalClients) * 100 : 0,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      emoji: '🚨',
    },
    {
      label: 'Medium Risk',
      value: riskAssessment.mediumRisk,
      percentage: totalClients > 0 ? (riskAssessment.mediumRisk / totalClients) * 100 : 0,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      emoji: '⚠️',
    },
    {
      label: 'Low Risk',
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
      <Card className="card-flat">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary flex items-center gap-2">
            🎯 Client Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskMetrics.map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
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
      <Card className="card-flat">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary">
            Relationship Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-primary">
                {clientRetentionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Client Retention Rate
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Clients with multiple projects
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-primary">
                {averageClientLifetime.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Average Client Lifetime
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Months of collaboration
              </div>
            </div>

            {riskAssessment.highRisk > 0 && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-red-700">
                  <span>⚠️</span>
                  <span className="text-sm font-medium">Action Required</span>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  You have {riskAssessment.highRisk} high-risk client{riskAssessment.highRisk !== 1 ? 's' : ''} that may need attention.
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