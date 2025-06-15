
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useT } from '@/lib/i18n';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardProjectList from "@/components/dashboard/DashboardProjectList";
import { useDashboard } from '@/hooks/useDashboard';

const Dashboard = () => {
  const t = useT();
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">{t('loadingDashboard')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    console.log('Dashboard: Rendering without user - this should not happen');
    return <div>{t('loadingDashboard')}</div>;
  }

  return (
    <Layout user={profile || user} onSignOut={handleSignOut}>
      <div className="space-y-8">
        <DashboardHeader
          displayName={displayName}
          onNewProject={() => navigate("/create-project")}
        />
        <DashboardStats
          totalProjects={stats.totalProjects}
          totalEarnings={stats.totalEarnings}
          completedMilestones={stats.completedMilestones}
          totalMilestones={stats.totalMilestones}
          pendingPayments={stats.pendingPayments}
          userCurrency={userCurrency}
        />
        <DashboardProjectList
          projects={projects}
          userCurrency={userCurrency}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onNewProject={() => navigate("/create-project")}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
