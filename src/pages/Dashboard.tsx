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
  
  console.log('Dashboard: Component starting to render');
  
  try {
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

    // Debug logging
    console.log('Dashboard render state:', {
      user: !!user,
      profile: !!profile,
      loading,
      projectsCount: projects?.length || 0,
      userCurrency,
      stats,
      displayName
    });
    
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

  console.log('Dashboard: About to check loading state, loading =', loading);

  if (loading) {
    console.log('Dashboard: Showing loading state');
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

  console.log('Dashboard: Not loading, about to render main dashboard');

  const EmptyProjectsButton = () => {
    const userType = profile?.user_type || 'free';
    const buttonText = !usage.canCreateProject && userType === 'pro' ? t('contactUsForMoreProjects') : t('createFirstProject');
    const ButtonIcon = !usage.canCreateProject && userType === 'pro' ? MessageCircle : Plus;
    const tooltipMessage = !usage.canCreateProject ? userType === 'pro' ? t('projectLimitReachedPro') : t('projectLimitReached') : '';
    
    const button = (
      <Button 
        onClick={handleNewProject} 
        size="lg" 
        className={`${isMobile ? 'w-full' : 'w-full sm:w-auto'} px-6 py-3 text-base min-h-[44px] touch-manipulation bg-gray-900 hover:bg-gray-800 text-white font-medium border-0 shadow-none`} 
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
      <div className={`space-y-8 ${isMobile ? 'px-2' : ''}`}>
        {/* Dashboard Header with semantic HTML structure */}
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
          <div className="space-y-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <h2 className="text-xl font-medium text-gray-900">{t('yourProjects')}</h2>
            </div>

            {projects.length === 0 ? (
              <div className={`text-center py-12 bg-white rounded-lg border border-gray-100 ${isMobile ? 'mx-0' : 'mx-2 sm:mx-0'}`}>
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-medium text-gray-600 mb-2 px-4">
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
              <section aria-label="Your projects" className="space-y-4">
                {projects.map(project => (
                  <div key={project.id} className={isMobile ? 'project-card-mobile' : ''}>
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
  } catch (error) {
    console.error('Dashboard: Error rendering dashboard:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
          <p className="text-gray-600 mb-4">An error occurred while loading the dashboard.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default Dashboard;
