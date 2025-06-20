
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
import { Plus, FileText, MessageCircle } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const navigate = useNavigate();
  const t = useT();
  const isMobile = useIsMobile();
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
    } else {
      // If user is Pro and reached limits, go to contact page
      const userType = profile?.user_type || 'free';
      if (userType === 'pro') {
        navigate('/contact');
      }
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
        <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-slate-900"></div>
        </div>
      </Layout>
    );
  }

  const EmptyProjectsButton = () => {
    const userType = profile?.user_type || 'free';
    const buttonText = !usage.canCreateProject && userType === 'pro' 
      ? t('contactUsForMoreProjects')
      : t('createFirstProject');
    
    const ButtonIcon = !usage.canCreateProject && userType === 'pro' ? MessageCircle : Plus;
    
    const tooltipMessage = !usage.canCreateProject 
      ? (userType === 'pro' 
          ? t('projectLimitReachedPro')
          : t('projectLimitReached'))
      : '';

    const button = (
      <Button 
        onClick={handleNewProject} 
        size="lg"
        className="w-full sm:w-auto px-6 py-3 text-base"
        disabled={false}
      >
        <ButtonIcon className="w-5 h-5 mr-2" />
        {buttonText}
      </Button>
    );

    if (tooltipMessage && !isMobile) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipMessage}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  // Always use vertical layout on mobile for better readability
  const projectGridClass = isMobile 
    ? "flex flex-col space-y-4 sm:space-y-6" 
    : "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6";

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="space-y-6 sm:space-y-8">
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
        
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{t('yourProjects')}</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/templates')}
              className="flex items-center gap-2 w-full sm:w-auto px-4 py-2"
              size="default"
            >
              <FileText className="w-4 h-4" />
              {t('templates')}
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-slate-200 mx-2 sm:mx-0">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-slate-600 mb-2 px-4">
                {t('noProjectsYet')}
              </h3>
              <p className="text-sm sm:text-base text-slate-400 mb-6 px-4 max-w-md mx-auto">
                {t('createFirstProjectDesc')}
              </p>
              <div className="px-4">
                <EmptyProjectsButton />
              </div>
            </div>
          ) : (
            <div className={projectGridClass}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewClick={handleViewProject}
                  onEditClick={handleEditProjectCard}
                  onDeleteClick={handleDeleteProject}
                  currency={userCurrency.currency}
                  isVerticalLayout={true}
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
