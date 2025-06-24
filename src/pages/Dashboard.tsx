
import React from 'react';
import Layout from '@/components/Layout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ProjectCard from '@/components/ProjectCard';
import { UsageIndicators } from '@/components/dashboard/UsageIndicators';
import SEOHead from '@/components/SEO/SEOHead';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardSEO } from '@/hooks/dashboard/useDashboardSEO';
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
    handleDeleteProject
  } = useDashboard();
  
  const usage = useUsageTracking(profile, projects);
  
  // Generate SEO data
  const seoData = useDashboardSEO(displayName, stats, userCurrency.currency, projects);

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
        <SEOHead 
          title="Loading Dashboard | Ruzma"
          description="Loading your freelancer dashboard..."
          canonical={`${window.location.origin}/dashboard`}
        />
        <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-slate-900"></div>
        </div>
      </Layout>
    );
  }

  const EmptyProjectsButton = () => {
    const userType = profile?.user_type || 'free';
    const buttonText = !usage.canCreateProject && userType === 'pro' ? t('contactUsForMoreProjects') : t('createFirstProject');
    const ButtonIcon = !usage.canCreateProject && userType === 'pro' ? MessageCircle : Plus;
    const tooltipMessage = !usage.canCreateProject ? userType === 'pro' ? t('projectLimitReachedPro') : t('projectLimitReached') : '';
    
    const button = (
      <Button 
        onClick={handleNewProject} 
        size="lg" 
        className={`${isMobile ? 'w-full' : 'w-full sm:w-auto'} px-6 py-3 text-base min-h-[44px] touch-manipulation`} 
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

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <SEOHead 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical={seoData.canonical}
        type={seoData.type}
        author={seoData.author}
        structuredData={seoData.structuredData}
      />
      <div className={`space-y-6 ${isMobile ? 'px-2' : 'sm:space-y-8'}`}>
        {/* Dashboard Header with semantic HTML structure */}
        <header>
          <DashboardHeader 
            displayName={displayName} 
            onNewProject={handleNewProject} 
            canCreateProject={usage.canCreateProject} 
            onViewAnalytics={() => navigate('/analytics')} 
          />
        </header>
        
        {/* Usage Indicators */}
        <section aria-label="Usage indicators">
          <UsageIndicators userProfile={profile} projects={projects} />
        </section>
        
        {/* Dashboard Statistics */}
        <section aria-label="Dashboard statistics">
          <DashboardStats 
            totalProjects={stats.totalProjects} 
            totalEarnings={stats.totalEarnings} 
            completedMilestones={stats.completedMilestones} 
            totalMilestones={stats.totalMilestones} 
            pendingPayments={stats.pendingPayments} 
            userCurrency={userCurrency.currency} 
          />
        </section>
        
        {/* Projects Section */}
        <main>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{t('yourProjects')}</h1>
            </div>

            {projects.length === 0 ? (
              <div className={`text-center py-8 sm:py-12 bg-white rounded-lg border border-slate-200 ${isMobile ? 'mx-0' : 'mx-2 sm:mx-0'}`}>
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-medium text-slate-600 mb-2 px-4">
                  {t('noProjectsYet')}
                </h2>
                <p className="text-sm sm:text-base text-slate-400 mb-6 px-4 max-w-md mx-auto">
                  {t('createFirstProjectDesc')}
                </p>
                <div className="px-4">
                  <EmptyProjectsButton />
                </div>
              </div>
            ) : (
              <section aria-label="Your projects" className="space-y-4 sm:space-y-6">
                {projects.map(project => (
                  <div key={project.id} className={isMobile ? 'project-card-mobile' : ''}>
                    <ProjectCard 
                      project={project} 
                      onViewClick={handleViewProject} 
                      onEditClick={handleEditProjectCard} 
                      onDeleteClick={handleDeleteProject} 
                      currency={userCurrency.currency} 
                      isVerticalLayout={true} 
                    />
                  </div>
                ))}
              </section>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Dashboard;
