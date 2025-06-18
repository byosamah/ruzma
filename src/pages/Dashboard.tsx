
import React from 'react';
import Layout from '@/components/Layout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ProjectCard from '@/components/ProjectCard';
import { UsageIndicators } from '@/components/dashboard/UsageIndicators';
import { useDashboard } from '@/hooks/useDashboard';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const Dashboard = () => {
  const navigate = useNavigate();
  const t = useT();
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

  const usage = useUsageTracking(profile, projects);

  const handleNewProject = () => {
    if (usage.canCreateProject) {
      navigate('/create-project');
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const handleEditProjectCard = (projectId: string) => {
    navigate(`/edit-project/${projectId}`);
  };

  if (loading) {
    return (
      <Layout user={user} onSignOut={handleSignOut}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900"></div>
        </div>
      </Layout>
    );
  }

  const EmptyProjectsButton = () => {
    const button = (
      <Button 
        onClick={handleNewProject} 
        size="lg" 
        className="mt-4"
        disabled={!usage.canCreateProject}
      >
        <Plus className="w-5 h-5 mr-2" />
        {t('createFirstProject')}
      </Button>
    );

    if (!usage.canCreateProject) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>Project limit reached. Upgrade your plan to create more projects.</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  // Determine layout based on project count
  const isOddNumber = projects.length % 2 === 1;
  const projectGridClass = isOddNumber 
    ? "flex flex-col space-y-6" 
    : "grid grid-cols-1 md:grid-cols-2 gap-6";

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="space-y-8">
        <DashboardHeader 
          displayName={displayName} 
          onNewProject={handleNewProject}
          canCreateProject={usage.canCreateProject}
          onViewAnalytics={() => navigate('/analytics')}
        />
        
        {/* Usage Indicators */}
        <UsageIndicators userProfile={profile} projects={projects} />
        
        <DashboardStats 
          totalProjects={stats.totalProjects}
          totalEarnings={stats.totalEarnings}
          completedMilestones={stats.completedMilestones}
          totalMilestones={stats.totalMilestones}
          pendingPayments={stats.pendingPayments}
          userCurrency={userCurrency.currency}
        />
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">{t('yourProjects')}</h2>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">
                {t('noProjectsYet')}
              </h3>
              <p className="text-slate-400 mb-4">{t('createFirstProjectDesc')}</p>
              <EmptyProjectsButton />
            </div>
          ) : (
            <div className={projectGridClass}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewClick={handleViewProject}
                  onEditClick={handleEditProjectCard}
                  currency={userCurrency.currency}
                  isVerticalLayout={isOddNumber}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
