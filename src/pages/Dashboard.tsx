import Layout from '@/components/Layout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ProjectCard from '@/components/ProjectCard';
import { UsageIndicators } from '@/components/dashboard/UsageIndicators';
import SEOHead from '@/components/SEO/SEOHead';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardSEO } from '@/hooks/dashboard/useDashboardSEO';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { Button } from '@/components/ui/button';
// Replaced icons with emojis
import { useT } from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { GracePeriodWarning } from '@/components/Subscription/GracePeriodWarning';

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
        className="w-full px-4 sm:px-6 py-3 text-sm sm:text-base min-h-[48px] bg-gray-900 hover:bg-gray-800 text-white font-medium border-0 shadow-none touch-manipulation" 
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
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex flex-col sm:gap-4 sm:py-4">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {/* Dashboard Header */}
            <DashboardHeader
              displayName={displayName}
              onNewProject={handleNewProject}
              canCreateProject={usage.canCreateProject}
            />

            {/* Grace Period Warning */}
            <GracePeriodWarning variant="card" className="w-full" />

            {/* Usage Indicators */}
            <div className="space-y-4">
              <UsageIndicators userProfile={profile} projects={projects} />
            </div>

            {/* Dashboard Statistics - 2x2 Grid */}
            <div className="space-y-4">
              <DashboardStats
                totalProjects={stats.totalProjects}
                totalEarnings={stats.totalEarnings}
                completedMilestones={stats.completedMilestones}
                totalMilestones={stats.totalMilestones}
                pendingPayments={stats.pendingPayments}
                userCurrency={userCurrency.currency}
              />
            </div>

            {/* Projects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold md:text-xl">{t('yourProjects')}</h2>
              </div>

              {!projects.length ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <div className="mx-auto max-w-md space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-4xl">
                      📄
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{t('noProjectsYet')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('createFirstProjectDesc')}
                      </p>
                    </div>
                    <EmptyProjectsButton />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onViewClick={() => handleViewProject(project.slug)}
                      onEditClick={() => handleEditProjectCard(project.slug)}
                      onDeleteClick={handleDeleteProject}
                      currency={userCurrency.currency}
                      convertFrom={project.currency || project.freelancer_currency}
                      isVerticalLayout={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
