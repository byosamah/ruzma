
import React from 'react';
import Layout from '@/components/Layout';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import AnalyticsHeader from '@/components/Analytics/AnalyticsHeader';
import AnalyticsMetrics from '@/components/Analytics/AnalyticsMetrics';
import AnalyticsCharts from '@/components/Analytics/AnalyticsCharts';

const Analytics = () => {
  const {
    user,
    loading,
    projects,
    userCurrency,
    handleSignOut
  } = useDashboard();
  
  const analyticsData = useDashboardAnalytics(projects);

  if (loading) {
    return (
      <Layout user={user} onSignOut={handleSignOut}>
        <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-slate-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <AnalyticsHeader />
        
        <AnalyticsMetrics
          revenueGrowth={analyticsData.revenueGrowth}
          avgProjectValue={analyticsData.avgProjectValue}
          completionRate={analyticsData.completionRate}
          userCurrency={userCurrency.currency}
        />
        
        <AnalyticsCharts
          data={analyticsData}
          userCurrency={userCurrency.currency}
        />
      </div>
    </Layout>
  );
};

export default Analytics;
