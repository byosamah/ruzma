import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useT } from '@/lib/i18n';
import { CurrencyCode } from '@/lib/currency';
import { AdvancedAnalyticsData } from '@/types/advancedAnalytics';
import AnalyticsMetrics from '@/components/Analytics/AnalyticsMetrics';
import AnalyticsCharts from '@/components/Analytics/AnalyticsCharts';

// Client Intelligence Components
import ClientLifetimeValue from './ClientIntelligence/ClientLifetimeValue';
import ClientSegmentation from './ClientIntelligence/ClientSegmentation';
import ClientRiskAssessment from './ClientIntelligence/ClientRiskAssessment';

// Profitability Components
import ProjectTypeProfitability from './ProfitabilityAnalytics/ProjectTypeProfitability';
import PricingInsights from './ProfitabilityAnalytics/PricingInsights';
import RevenueOptimization from './ProfitabilityAnalytics/RevenueOptimization';

interface AdvancedAnalyticsLayoutProps {
  data: AdvancedAnalyticsData;
  basicAnalytics: any;
  userCurrency: CurrencyCode;
}

const AdvancedAnalyticsLayout: React.FC<AdvancedAnalyticsLayoutProps> = ({
  data,
  basicAnalytics,
  userCurrency,
}) => {
  const t = useT();

  return (
    <div className="space-y-4 sm:space-y-6 rtl:space-y-reverse">
      <Tabs defaultValue="profitability" className="w-full"
        dir={t('clientIntelligence') === 'ذكاء العملاء' ? 'rtl' : 'ltr'}>
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="client-intelligence" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2.5 text-xs sm:text-sm">
            <span className="text-sm sm:text-base">👥</span>
            <span className="hidden sm:inline">{t('clientIntelligence')}</span>
            <span className="sm:hidden">{t('clientIntelligenceShort')}</span>
          </TabsTrigger>
          <TabsTrigger value="profitability" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2.5 text-xs sm:text-sm">
            <span className="text-sm sm:text-base">💰</span>
            <span className="hidden sm:inline">{t('profitabilityAnalytics')}</span>
            <span className="sm:hidden">{t('profitabilityShort')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Client Intelligence Tab */}
        <TabsContent value="client-intelligence" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 rtl:space-y-reverse">
          <div className="space-y-4 sm:space-y-6 rtl:space-y-reverse">
            {/* Client Lifetime Value */}
            <ClientLifetimeValue
              clients={data.clientIntelligence.topClientsByValue}
              userCurrency={userCurrency}
            />

            {/* Client Segmentation */}
            <ClientSegmentation
              segments={data.clientIntelligence.clientSegments}
              userCurrency={userCurrency}
            />

            {/* Risk Assessment */}
            <ClientRiskAssessment
              riskAssessment={data.clientIntelligence.riskAssessment}
              clientRetentionRate={data.clientIntelligence.clientRetentionRate}
              averageClientLifetime={data.clientIntelligence.averageClientLifetime}
            />
          </div>
        </TabsContent>

        {/* Profitability Analytics Tab */}
        <TabsContent value="profitability" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 rtl:space-y-reverse">
          <div className="space-y-4 sm:space-y-6 rtl:space-y-reverse">
            {/* Basic Analytics Integration */}
            <AnalyticsMetrics
              revenueGrowth={basicAnalytics.revenueGrowth}
              avgProjectValue={basicAnalytics.avgProjectValue}
              completionRate={basicAnalytics.completionRate}
              userCurrency={userCurrency}
            />
            
            <AnalyticsCharts
              data={basicAnalytics}
              userCurrency={userCurrency}
            />

            {/* Project Type Profitability */}
            <ProjectTypeProfitability
              projectTypes={data.profitability.projectTypes}
              userCurrency={userCurrency}
            />

            {/* Pricing Insights */}
            <PricingInsights
              pricingTrends={data.profitability.pricingTrends}
              revenueOptimization={data.profitability.revenueOptimization}
              userCurrency={userCurrency}
            />

            {/* Revenue Optimization */}
            <RevenueOptimization
              profitabilityMetrics={data.profitability.profitabilityMetrics}
              userCurrency={userCurrency}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsLayout;