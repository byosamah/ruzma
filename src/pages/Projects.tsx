
import React from 'react';
import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import YouTubePopup from '@/components/YouTubePopup';
import { Button } from '@/components/ui/button';
// Icons replaced with emojis
import { useT } from '@/lib/i18n';
import { useDashboard } from '@/hooks/useDashboard';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const Projects = () => {
  console.log('Projects component initializing...');
  
  const { navigate } = useLanguageNavigation();
  const t = useT();
  const isMobile = useIsMobile();
  
  console.log('About to call useDashboard...');
  const {
    user,
    profile,
    loading,
    projects,
    userCurrency,
    handleSignOut,
    handleDeleteProject,
  } = useDashboard();
  
  console.log('useDashboard completed, projects length:', projects?.length);

  const usage = useUsageTracking(profile, projects);

  const handleNewProject = () => {
    if (usage.canCreateProject) {
      navigate('/create-project');
    }
  };

  const handleViewProject = (projectSlug: string) => {
    navigate(`/project/${projectSlug}`);
  };

  const handleEditProjectCard = (projectSlug: string) => {
    navigate(`/edit-project/${projectSlug}`);
  };

  const handleDeleteProjectCard = (projectId: string) => {
    handleDeleteProject(projectId);
  };

  if (loading) {
    return (
      <Layout user={user} onSignOut={handleSignOut}>
        <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-medium text-gray-900">{t('yourProjects')}</h1>
                <YouTubePopup 
                  videoId="j5LEQveezuI"
                  buttonText={t('knowMore')}
                  buttonVariant="ghost"
                  buttonSize="sm"
                />
              </div>
              <p className="text-sm text-gray-500">
                {projects.length === 0 
                  ? t('noProjectsYet') 
                  : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`
                }
              </p>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => navigate('/templates')}
                className="flex items-center justify-center gap-2 border-gray-200 text-gray-600 hover:bg-gray-50 mobile-touch-target"
              >
                <span className="text-base sm:text-lg">📄</span>
                <span className="text-sm sm:text-base">{t('templates')}</span>
              </Button>
              <Button 
                onClick={handleNewProject}
                disabled={!usage.canCreateProject}
                className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium border-0 shadow-none mobile-touch-target"
              >
                <span className="text-base sm:text-lg">✨</span>
                <span className="text-sm sm:text-base">{t('newProject')}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-lg border border-gray-100">
            <span className="text-4xl sm:text-6xl text-gray-300 mx-auto mb-4 sm:mb-6 block">📄</span>
            <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2 px-4">
              {t('noProjectsYet')}
            </h3>
            <p className="text-sm text-gray-500 mb-6 sm:mb-8 px-4 max-w-md mx-auto">
              {t('createFirstProjectDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {projects.map((project) => (
              <div key={project.id}>
                <ProjectCard
                  project={project}
                  onViewClick={() => handleViewProject(project.slug)}
                  onEditClick={() => handleEditProjectCard(project.slug)}
                  onDeleteClick={() => handleDeleteProjectCard(project.id)}
                  currency={userCurrency.currency}
                  isVerticalLayout={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
