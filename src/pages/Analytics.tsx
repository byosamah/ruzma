
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/core/useAuth';
import { useDashboardDataQuery } from '@/hooks/dashboard/useDashboardDataQuery';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useSimpleAnalytics } from '@/hooks/useSimpleAnalytics';
import { useAIInsights } from '@/hooks/analytics/useAIInsights';
import { useAIProjectTypes } from '@/hooks/analytics/useAIProjectTypes';
import SimpleAnalyticsCard from '@/components/Analytics/SimpleAnalyticsCard';
import InteractiveChart from '@/components/Analytics/InteractiveChart';
import ProjectTypesList from '@/components/Analytics/ProjectTypesList';
import SimpleUpgradeMessage from '@/components/Analytics/SimpleUpgradeMessage';
import AIInsightCard from '@/components/Analytics/AIInsightCard';
import AIRecommendations from '@/components/Analytics/AIRecommendations';
import SEOHead from '@/components/SEO/SEOHead';
import { useT } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, TrendingUp, Sparkles } from 'lucide-react';

const Analytics = () => {
  const t = useT();
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading: dataLoading } = useDashboardDataQuery(user);
  const userCurrency = useUserCurrency(data?.profile);
  
  const loading = authLoading || dataLoading;
  const projects = data?.projects || [];
  
  const analytics = useSimpleAnalytics(projects, userCurrency?.currency || 'USD');
  const aiInsights = useAIInsights(projects, userCurrency?.currency || 'USD');
  const aiProjectTypes = useAIProjectTypes(projects);
  
  const handleSignOut = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <Layout user={user} onSignOut={handleSignOut}>
        <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <SEOHead 
        title="Analytics | Ruzma"
        description="View your freelance business analytics and performance metrics"
        canonical={`${window.location.origin}/analytics`}
      />
      
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl">
        {/* Page Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1 sm:mb-2">
            <h1 className="text-xl sm:text-2xl font-medium text-gray-900 break-words">
              {t('analytics')}
            </h1>
          </div>
          <p className="text-sm text-gray-500 break-words">
            {t('analyticsSubtitle')}
          </p>
        </header>

        {/* Revenue Overview */}
        <section aria-label="Revenue overview">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">📈 {t('revenueOverview')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <SimpleAnalyticsCard
              emoji="💰"
              title={t('thisMonth')}
              value={analytics.revenue.thisMonth}
              subtitle={t('currentMonthEarnings')}
              trend={analytics.revenue.trend}
              chart={{
                data: analytics.revenue.chartData,
                type: 'line',
                color: '#10b981'
              }}
            />
            <SimpleAnalyticsCard
              emoji="📅"
              title={t('lastMonth')}
              value={analytics.revenue.lastMonth}
              subtitle={t('previousMonth')}
            />
            <SimpleAnalyticsCard
              emoji="📊"
              title={t('averageProject')}
              value={analytics.revenue.averageProject}
              subtitle={t('perProjectValue')}
            />
            <SimpleAnalyticsCard
              emoji="⚡"
              title={t('collectionSpeed')}
              value={analytics.revenue.collectionSpeed}
              subtitle={t('averagePaymentTime')}
            />
          </div>
        </section>

        {/* Time & Productivity */}
        <section aria-label="Time and productivity">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">⏱️ {t('timeAndProductivity')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <SimpleAnalyticsCard
              emoji="📈"
              title={t('avgDuration')}
              value={analytics.time.averageProjectDuration}
              subtitle={t('perProject')}
              chart={{
                data: analytics.time.durationTrend,
                type: 'bar',
                color: '#3b82f6'
              }}
            />
            <SimpleAnalyticsCard
              emoji="🔄"
              title={t('activeProjects')}
              value={analytics.time.activeProjectsTime}
              subtitle={t('currentlyWorkingOn')}
            />
            <SimpleAnalyticsCard
              emoji="🚀"
              title={t('fastestProject')}
              value={analytics.time.fastestProject}
              subtitle={t('recordCompletion')}
            />
            <SimpleAnalyticsCard
              emoji="⏰"
              title={t('thisMonth')}
              value={analytics.time.currentMonthHours}
              subtitle={t('estimatedHours')}
            />
          </div>
        </section>

        {/* Client Insights */}
        <section aria-label="Client insights">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">👥 {t('clientInsights')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <SimpleAnalyticsCard
              emoji="👤"
              title={t('totalClients')}
              value={analytics.clients.totalClients}
              subtitle={t('allTime')}
              chart={{
                data: analytics.clients.growthTrend,
                type: 'line',
                color: '#f59e0b'
              }}
            />
            <SimpleAnalyticsCard
              emoji="🔄"
              title={t('repeatClients')}
              value={analytics.clients.repeatClients}
              subtitle={t('returnCustomers')}
            />
            <SimpleAnalyticsCard
              emoji="⭐"
              title={t('bestClient')}
              value={analytics.clients.bestClient}
              subtitle={t('highestRevenue')}
            />
            <SimpleAnalyticsCard
              emoji="✨"
              title={t('newThisMonth')}
              value={analytics.clients.newClientsThisMonth}
              subtitle={t('freshClients')}
            />
          </div>
        </section>

        {/* Performance Metrics */}
        <section aria-label="Performance metrics">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">🎯 {t('performanceMetrics')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <SimpleAnalyticsCard
              emoji="✅"
              title={t('successRate')}
              value={analytics.performance.successRate}
              subtitle={t('completedMilestones')}
              chart={{
                data: analytics.performance.successTrend,
                type: 'line',
                color: '#10b981'
              }}
            />
            <SimpleAnalyticsCard
              emoji="⏰"
              title={t('onTimeDelivery')}
              value={analytics.performance.onTimeDelivery}
              subtitle={t('meetingDeadlines')}
            />
            <SimpleAnalyticsCard
              emoji="😊"
              title={t('clientSatisfaction')}
              value={analytics.performance.clientSatisfaction}
              subtitle={t('estimatedScore')}
              chart={{
                data: [analytics.performance.satisfactionScore],
                type: 'progress',
                color: '#8b5cf6'
              }}
            />
            <SimpleAnalyticsCard
              emoji="📈"
              title={t('monthlyGrowth')}
              value={analytics.performance.monthlyGrowth}
              subtitle={t('revenueChange')}
            />
          </div>
        </section>

        {/* Financial Analysis */}
        <section aria-label="Financial analysis">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">💰 {t('financialAnalysis')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border-0 shadow-none bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>📈</span> {t('cashFlowTrend')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-hidden">
                  <InteractiveChart
                    data={analytics.financial.cashFlow}
                    type="area"
                    height={200}
                    width={300}
                    color="#10b981"
                    showTooltip={true}
                    animated={true}
                    gradientFill={true}
                    className="w-full max-w-full"
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <SimpleAnalyticsCard
                emoji="💳"
                title={t('avgInvoice')}
                value={analytics.financial.averageInvoiceValue}
                subtitle={t('perInvoiceValue')}
              />
              <SimpleAnalyticsCard
                emoji="⚡"
                title={t('conversionRate')}
                value={analytics.financial.conversionRate}
                subtitle={t('milestoneApproval')}
              />
              <SimpleAnalyticsCard
                emoji="🎯"
                title={t('profitMargin')}
                value={analytics.financial.profitMargin}
                subtitle={t('estimatedProfit')}
              />
              <SimpleAnalyticsCard
                emoji="⏰"
                title={t('pendingRatio')}
                value={analytics.financial.overduePendingRatio}
                subtitle={t('pendingMilestones')}
              />
            </div>
          </div>
        </section>

        {/* Detailed Charts Section */}
        <section aria-label="Detailed analytics charts">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">📊 {t('detailedAnalytics')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Top Clients Chart */}
            <Card className="border-0 shadow-none bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>👥</span> {t('topClientsByRevenue')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-hidden">
                  <InteractiveChart
                    data={analytics.revenue.topClients}
                    type="bar"
                    height={200}
                    width={300}
                    color="#3b82f6"
                    showTooltip={true}
                    animated={true}
                    gradientFill={true}
                    className="w-full max-w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project Types Distribution */}
            <Card className="border-0 shadow-none bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>🎨</span> {t('projectTypes')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectTypesList
                  data={aiProjectTypes.projectTypes}
                />
                {aiProjectTypes.isLoading && !aiProjectTypes.upgradeRequired && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-3 p-2 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>AI is analyzing your projects...</span>
                  </div>
                )}
                {aiProjectTypes.error && !aiProjectTypes.canUseAI && !aiProjectTypes.upgradeRequired && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 mt-3 p-2 bg-amber-50 rounded-lg">
                    <span>⚠️</span>
                    <span>Using fallback analysis - Daily AI limit reached</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quality Metrics */}
            <Card className="border-0 shadow-none bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>⭐</span> {t('qualityMetrics')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-hidden">
                  <InteractiveChart
                    data={analytics.performance.qualityMetrics}
                    type="bar"
                    height={200}
                    width={300}
                    color="#8b5cf6"
                    showTooltip={true}
                    animated={true}
                    gradientFill={true}
                    className="w-full max-w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Workload Balance */}
            <Card className="border-0 shadow-none bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>⚖️</span> {t('workloadBalance')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-hidden">
                  <InteractiveChart
                    data={analytics.time.workloadBalance}
                    type="pie"
                    height={200}
                    width={300}
                    color="#10b981"
                    showTooltip={true}
                    animated={true}
                    gradientFill={true}
                    className="w-full max-w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trends Analysis */}
        <section aria-label="Trends analysis">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">📈 {t('trendsAndGrowth')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-none bg-gray-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>📅</span> {t('yearOverYearGrowth')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-hidden">
                    <InteractiveChart
                      data={analytics.trends.yearOverYear}
                      type="line"
                      height={200}
                      width={400}
                      color="#f59e0b"
                      showTooltip={true}
                      animated={true}
                      gradientFill={true}
                      className="w-full max-w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <SimpleAnalyticsCard
                emoji="📊"
                title={t('growthRate')}
                value={analytics.trends.growthRate}
                subtitle={t('monthlyGrowth')}
              />
              <SimpleAnalyticsCard
                emoji="🏆"
                title={t('marketPosition')}
                value={analytics.trends.marketPosition}
                subtitle={t('performanceLevel')}
              />
              <SimpleAnalyticsCard
                emoji="🎯"
                title={t('productivity')}
                value={`${analytics.time.productivityScore}%`}
                subtitle={t('overallScore')}
                chart={{
                  data: [analytics.time.productivityScore],
                  type: 'progress',
                  color: '#10b981'
                }}
              />
            </div>
          </div>
        </section>

        {/* Additional Insights */}
        <section aria-label="Additional insights">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">🔍 {t('additionalInsights')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <SimpleAnalyticsCard
              emoji="🔄"
              title={t('clientRetention')}
              value={analytics.clients.clientRetention}
              subtitle={t('repeatClientRate')}
            />
            <SimpleAnalyticsCard
              emoji="💎"
              title={t('avgClientValue')}
              value={analytics.clients.avgClientValue}
              subtitle={t('revenuePerClient')}
            />
            <SimpleAnalyticsCard
              emoji="🚀"
              title={t('projectedRevenue')}
              value={analytics.revenue.projectedRevenue}
              subtitle={t('nextMonthForecast')}
            />
            <SimpleAnalyticsCard
              emoji="⏱️"
              title={t('weeklyHours')}
              value={`${analytics.time.weeklyHours.reduce((sum, w) => sum + w.value, 0) / analytics.time.weeklyHours.length}h`}
              subtitle={t('averagePerWeek')}
              chart={{
                data: analytics.time.weeklyHours.map(w => w.value),
                type: 'bar',
                color: '#6366f1'
              }}
            />
          </div>
        </section>

        {/* AI-Powered Business Insights */}
        <section aria-label="AI business insights">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">🤖 {t('aiBusinessInsights')}</h2>
          
          {aiInsights.upgradeRequired ? (
            <div className="text-center py-12">
              <SimpleUpgradeMessage 
                message={t('aiInsightsForPro')}
              />
            </div>
          ) : aiInsights.isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {[1, 2].map((index) => (
                <Card key={index} className="border-0 shadow-none bg-gray-50">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : aiInsights.insights.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {aiInsights.insights.map((insight, index) => (
                <AIInsightCard 
                  key={index} 
                  insight={insight}
                  onImplement={() => {
                    // Could integrate with task management or notes
                    console.log('Implementing insight:', insight.title);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-none bg-gray-50">
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">{t('aiInsightsComingSoon')}</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  {t('completeMoreProjects')}
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* AI Recommendations */}
        <section aria-label="AI recommendations">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">💡 {t('smartRecommendations')}</h2>
          {aiInsights.upgradeRequired ? (
            <div className="text-center py-12">
              <SimpleUpgradeMessage 
                message={t('smartRecommendationsForPro')}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <AIRecommendations
                title={t('projectPortfolioOptimization')}
                recommendations={aiInsights.projectRecommendations}
                isLoading={aiInsights.isLoading}
                icon={<Target className="h-4 w-4" />}
                color="bg-blue-500"
              />
              
              <AIRecommendations
                title={t('revenueGrowthStrategies')}
                recommendations={aiInsights.revenueOptimizationTips}
                isLoading={aiInsights.isLoading}
                icon={<TrendingUp className="h-4 w-4" />}
                color="bg-green-500"
              />
            </div>
          )}
        </section>

        {/* Empty State for New Users */}
        {projects.length === 0 && (
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
            <span className="text-4xl sm:text-6xl text-gray-300 block mb-4">📊</span>
            <h3 className="text-lg font-medium text-gray-600 mb-2">{t('noAnalyticsYet')}</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {t('completeProjectsForAnalytics')}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
