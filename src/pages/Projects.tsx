
import React from 'react';
import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import YouTubePopup from '@/components/YouTubePopup';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useDashboard } from '@/hooks/useDashboard';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const Projects = () => {
  const { navigate } = useLanguageNavigation();
  const t = useT();
  const isMobile = useIsMobile();
  const {
    user,
    profile,
    loading,
    projects,
    userCurrency,
    handleSignOut,
    handleDeleteProject,
  } = useDashboard();

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
      <div className={`space-y-8 ${isMobile ? 'px-2' : ''}`}>
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-medium text-gray-900">{t('yourProjects')}</h1>
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
            {/* Always show buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/templates')}
                className={`flex items-center gap-2 ${isMobile ? 'w-full' : 'w-auto'} border-gray-200 text-gray-600 hover:bg-gray-50`}
              >
                <FileText className="w-4 h-4" />
                {t('templates')}
              </Button>
              <Button 
                onClick={handleNewProject}
                disabled={!usage.canCreateProject}
                className={`flex items-center gap-2 ${isMobile ? 'w-full' : 'w-auto'} bg-gray-900 hover:bg-gray-800 text-white font-medium border-0 shadow-none`}
              >
                <Plus className="w-4 h-4" />
                {t('newProject')}
              </Button>
            </div>
          </div>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className={`text-center py-16 bg-white rounded-lg border border-gray-100 ${isMobile ? 'mx-0' : 'mx-2 sm:mx-0'}`}>
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-6" aria-hidden="true" />
            <h3 className="text-lg font-medium text-gray-600 mb-2 px-4">
              {t('noProjectsYet')}
            </h3>
            <p className="text-sm text-gray-500 mb-8 px-4 max-w-md mx-auto">
              {t('createFirstProjectDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className={isMobile ? 'project-card-mobile' : ''}>
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
