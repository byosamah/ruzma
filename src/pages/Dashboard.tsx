
import React from 'react';
import Layout from '@/components/Layout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardProjectList } from '@/components/dashboard/DashboardProjectList';
import { DashboardAnalytics } from '@/components/dashboard/DashboardAnalytics';
import { UsageIndicators } from '@/components/dashboard/UsageIndicators';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';

const Dashboard = () => {
  const {
    user,
    profile,
    loading,
    projects,
    userCurrency,
    stats,
    displayName,
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
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
        <DashboardHeader displayName={displayName} />
        
        {/* Usage Indicators */}
        <UsageIndicators userProfile={profile} projects={projects} />
        
        <DashboardStats 
          stats={stats} 
          userCurrency={userCurrency}
          analyticsData={analyticsData}
        />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <DashboardProjectList
              projects={projects}
              userCurrency={userCurrency}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
            />
          </div>
          
          <div className="xl:col-span-1">
            <DashboardAnalytics analyticsData={analyticsData} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
