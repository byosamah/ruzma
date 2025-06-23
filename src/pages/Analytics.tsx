import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import DashboardAnalytics from '@/components/dashboard/DashboardAnalytics';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { useT } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';
const Analytics = () => {
  const navigate = useNavigate();
  const t = useT();
  const isMobile = useIsMobile();
  const {
    user,
    loading,
    projects,
    userCurrency,
    handleSignOut
  } = useDashboard();
  const analyticsData = useDashboardAnalytics(projects);
  if (loading) {
    return <Layout user={user} onSignOut={handleSignOut}>
        <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-slate-900"></div>
        </div>
      </Layout>;
  }
  return <Layout user={user} onSignOut={handleSignOut}>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center sm:text-left">
            Analytics
          </h1>
        </div>
        
        <div className="w-full">
          <DashboardAnalytics data={analyticsData} userCurrency={userCurrency.currency} />
        </div>
      </div>
    </Layout>;
};
export default Analytics;