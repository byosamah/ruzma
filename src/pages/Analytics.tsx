
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import DashboardAnalytics from '@/components/dashboard/DashboardAnalytics';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { useT } from '@/lib/i18n';

const Analytics = () => {
  const navigate = useNavigate();
  const t = useT();
  const {
    user,
    loading,
    projects,
    userCurrency,
    handleSignOut,
  } = useDashboard();

  const analyticsData = useDashboardAnalytics(projects);

  if (loading) {
    return (
      <Layout user={user} onSignOut={handleSignOut}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>
        </div>
        
        <div className="max-w-4xl">
          <DashboardAnalytics data={analyticsData} userCurrency={userCurrency.currency} />
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
