
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
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">📈 Revenue Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <SimpleAnalyticsCard
              emoji="💰"
              title="This Month"
              value={analytics.revenue.thisMonth}
              subtitle="Current month earnings"
              trend={analytics.revenue.trend}
              chart={{
                data: analytics.revenue.chartData,
                type: 'line',
                color: '#10b981'
              }}
            />
            <SimpleAnalyticsCard
              emoji="📅"
              title="Last Month"
              value={analytics.revenue.lastMonth}
              subtitle="Previous month"
            />
            <SimpleAnalyticsCard
              emoji="📊"
              title="Average Project"
              value={analytics.revenue.averageProject}
              subtitle="Per project value"
            />
            <SimpleAnalyticsCard
              emoji="⚡"
              title="Collection Speed"
              value={analytics.revenue.collectionSpeed}
              subtitle="Average payment time"
            />
          </div>
        </section>

        {/* Time & Productivity */}
        <section aria-label="Time and productivity">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">⏱️ Time & Productivity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <SimpleAnalyticsCard
              emoji="📈"
              title="Avg Duration"
              value={analytics.time.averageProjectDuration}
              subtitle="Per project"
              chart={{
                data: analytics.time.durationTrend,
                type: 'bar',
                color: '#3b82f6'
              }}
            />
            <SimpleAnalyticsCard
              emoji="🔄"
              title="Active Projects"
              value={analytics.time.activeProjectsTime}
              subtitle="Currently working on"
            />
            <SimpleAnalyticsCard
              emoji="🚀"
              title="Fastest Project"
              value={analytics.time.fastestProject}
              subtitle="Record completion"
            />
            <SimpleAnalyticsCard
              emoji="⏰"
              title="This Month"
              value={analytics.time.currentMonthHours}
              subtitle="Estimated hours"
            />
          </div>
        </section>

        {/* Client Insights */}
        <section aria-label="Client insights">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">👥 Client Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <SimpleAnalyticsCard
              emoji="👤"
              title="Total Clients"
              value={analytics.clients.totalClients}
              subtitle="All time"
              chart={{
                data: analytics.clients.growthTrend,
                type: 'line',
                color: '#f59e0b'
              }}
            />
            <SimpleAnalyticsCard
              emoji="🔄"
              title="Repeat Clients"
              value={analytics.clients.repeatClients}
              subtitle="Return customers"
            />
            <SimpleAnalyticsCard
              emoji="⭐"
              title="Best Client"
              value={analytics.clients.bestClient}
              subtitle="Highest revenue"
            />
            <SimpleAnalyticsCard
              emoji="✨"
              title="New This Month"
              value={analytics.clients.newClientsThisMonth}
              subtitle="Fresh clients"
            />
          </div>
        </section>

        {/* Performance Metrics */}
        <section aria-label="Performance metrics">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">🎯 Performance Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <SimpleAnalyticsCard
              emoji="✅"
              title="Success Rate"
              value={analytics.performance.successRate}
              subtitle="Completed milestones"
              chart={{
                data: analytics.performance.successTrend,
                type: 'line',
                color: '#10b981'
              }}
            />
            <SimpleAnalyticsCard
              emoji="⏰"
              title="On-Time Delivery"
              value={analytics.performance.onTimeDelivery}
              subtitle="Meeting deadlines"
            />
            <SimpleAnalyticsCard
              emoji="😊"
              title="Client Satisfaction"
              value={analytics.performance.clientSatisfaction}
              subtitle="Estimated score"
              chart={{
                data: [analytics.performance.satisfactionScore],
                type: 'progress',
                color: '#8b5cf6'
              }}
            />
            <SimpleAnalyticsCard
              emoji="📈"
              title="Monthly Growth"
              value={analytics.performance.monthlyGrowth}
              subtitle="Revenue change"
            />
          </div>
        </section>

        {/* Financial Analysis */}
        <section aria-label="Financial analysis">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">💰 Financial Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border-0 shadow-none bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>📈</span> Cash Flow Trend
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
                title="Avg Invoice"
                value={analytics.financial.averageInvoiceValue}
                subtitle="Per invoice value"
              />
              <SimpleAnalyticsCard
                emoji="⚡"
                title="Conversion Rate"
                value={analytics.financial.conversionRate}
                subtitle="Milestone approval"
              />
              <SimpleAnalyticsCard
                emoji="🎯"
                title="Profit Margin"
                value={analytics.financial.profitMargin}
                subtitle="Estimated profit"
              />
              <SimpleAnalyticsCard
                emoji="⏰"
                title="Pending Ratio"
                value={analytics.financial.overduePendingRatio}
                subtitle="Pending milestones"
              />
            </div>
          </div>
        </section>

        {/* Detailed Charts Section */}
        <section aria-label="Detailed analytics charts">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">📊 Detailed Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Top Clients Chart */}
            <Card className="border-0 shadow-none bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>👥</span> Top Clients by Revenue
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
                  <span>🎨</span> Project Types
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
                  <span>⭐</span> Quality Metrics
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
                  <span>⚖️</span> Workload Balance
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
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">📈 Trends & Growth</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-none bg-gray-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>📅</span> Year-over-Year Growth
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
                title="Growth Rate"
                value={analytics.trends.growthRate}
                subtitle="Monthly growth"
              />
              <SimpleAnalyticsCard
                emoji="🏆"
                title="Market Position"
                value={analytics.trends.marketPosition}
                subtitle="Performance level"
              />
              <SimpleAnalyticsCard
                emoji="🎯"
                title="Productivity"
                value={`${analytics.time.productivityScore}%`}
                subtitle="Overall score"
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
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">🔍 Additional Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <SimpleAnalyticsCard
              emoji="🔄"
              title="Client Retention"
              value={analytics.clients.clientRetention}
              subtitle="Repeat client rate"
            />
            <SimpleAnalyticsCard
              emoji="💎"
              title="Avg Client Value"
              value={analytics.clients.avgClientValue}
              subtitle="Revenue per client"
            />
            <SimpleAnalyticsCard
              emoji="🚀"
              title="Projected Revenue"
              value={analytics.revenue.projectedRevenue}
              subtitle="Next month forecast"
            />
            <SimpleAnalyticsCard
              emoji="⏱️"
              title="Weekly Hours"
              value={`${analytics.time.weeklyHours.reduce((sum, w) => sum + w.value, 0) / analytics.time.weeklyHours.length}h`}
              subtitle="Average per week"
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
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">🤖 AI Business Insights</h2>
          
          {aiInsights.upgradeRequired ? (
            <div className="text-center py-12">
              <SimpleUpgradeMessage 
                message="AI business insights and recommendations are available for Pro users"
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
                <h3 className="text-lg font-medium text-gray-600 mb-2">AI Insights Coming Soon</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Complete more projects to unlock AI-powered business insights and recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* AI Recommendations */}
        <section aria-label="AI recommendations">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">💡 Smart Recommendations</h2>
          {aiInsights.upgradeRequired ? (
            <div className="text-center py-12">
              <SimpleUpgradeMessage 
                message="Smart recommendations are available for Pro users"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <AIRecommendations
                title="Project Portfolio Optimization"
                recommendations={aiInsights.projectRecommendations}
                isLoading={aiInsights.isLoading}
                icon={<Target className="h-4 w-4" />}
                color="bg-blue-500"
              />
              
              <AIRecommendations
                title="Revenue Growth Strategies"
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
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Analytics Yet</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Complete a few projects to see your analytics and performance metrics here.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
