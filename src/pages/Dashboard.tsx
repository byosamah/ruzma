import React from 'react';
import Layout from '@/components/Layout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ProjectCard from '@/components/ProjectCard';
import { UsageIndicators } from '@/components/dashboard/UsageIndicators';
import SEOHead from '@/components/SEO/SEOHead';
import YouTubePopup from '@/components/YouTubePopup';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardSEO } from '@/hooks/dashboard/useDashboardSEO';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { Button } from '@/components/ui/button';
// Replaced icons with emojis
import { useT } from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { navigate } = useLanguageNavigation();
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

  const handleViewProject = (projectSlug: string) => {
    navigate(`/project/${projectSlug}`);
  };

  const handleEditProjectCard = (projectSlug: string) => {
    navigate(`/edit-project/${projectSlug}`);
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
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  const EmptyProjectsButton = () => {
    const userType = profile?.user_type || 'free';
    const buttonText = !usage.canCreateProject && userType === 'pro' ? t('contactUsForMoreProjects') : t('createFirstProject');
    const buttonEmoji = !usage.canCreateProject && userType === 'pro' ? '💬' : '✨';
    const tooltipMessage = !usage.canCreateProject ? userType === 'pro' ? t('projectLimitReachedPro') : t('projectLimitReached') : '';
    
    const button = (
      <Button 
        onClick={handleNewProject} 
        size="lg" 
        className="w-full px-6 py-3 text-base mobile-touch-target bg-gray-900 hover:bg-gray-800 text-white font-medium border-0 shadow-none" 
        disabled={false}
      >
        <span className="text-lg sm:text-xl mr-2">{buttonEmoji}</span>
        <span className="text-sm sm:text-base">{buttonText}</span>
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
        {/* Dashboard Header with tutorial button integrated */}
        <header>
          <DashboardHeader 
            displayName={displayName} 
            onNewProject={handleNewProject} 
            canCreateProject={usage.canCreateProject} 
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
              <h2 className="text-lg sm:text-xl font-medium text-gray-900">{t('yourProjects')}</h2>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-100">
                <span className="text-4xl sm:text-6xl text-gray-300 mx-auto mb-4 block">📄</span>
                <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2 px-4">
                  {t('noProjectsYet')}
                </h3>
                <p className="text-sm text-gray-500 mb-6 px-4 max-w-md mx-auto">
                  {t('createFirstProjectDesc')}
                </p>
                <div className="px-4">
                  <EmptyProjectsButton />
                </div>
              </div>
            ) : (
              <section aria-label="Your projects" className="space-y-3 sm:space-y-4">
                {projects.map(project => (
                  <div key={project.id}>
                    <ProjectCard 
                      project={project} 
                      onViewClick={() => handleViewProject(project.slug)} 
                      onEditClick={() => handleEditProjectCard(project.slug)} 
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
