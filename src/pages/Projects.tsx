
import React from 'react';
import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useDashboard } from '@/hooks/useDashboard';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const navigate = useNavigate();
  const t = useT();
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

  // Use project ID for deletion (not slug)
  const handleDeleteProjectCard = (projectId: string) => {
    handleDeleteProject(projectId);
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

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{t('yourProjects')}</h1>
            <p className="text-slate-600 mt-2">
              {projects.length === 0 
                ? t('noProjectsYet') 
                : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'} total`
              }
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/templates')}
              className="flex items-center gap-2 w-full sm:w-auto px-4 py-2"
            >
              <FileText className="w-4 h-4" />
              {t('templates')}
            </Button>
            <Button 
              onClick={handleNewProject}
              disabled={!usage.canCreateProject}
              className="flex items-center gap-2 w-full sm:w-auto px-4 py-2"
            >
              <Plus className="w-4 h-4" />
              {t('newProject')}
            </Button>
          </div>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-lg border border-slate-200 mx-2 sm:mx-0">
            <FileText className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 mx-auto mb-6" />
            <h3 className="text-xl sm:text-2xl font-medium text-slate-600 mb-3 px-4">
              {t('noProjectsYet')}
            </h3>
            <p className="text-base sm:text-lg text-slate-400 mb-8 px-4 max-w-md mx-auto">
              {t('createFirstProjectDesc')}
            </p>
            <div className="px-4">
              <Button 
                onClick={handleNewProject}
                disabled={!usage.canCreateProject}
                size="lg"
                className="w-full sm:w-auto px-6 py-3 text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('createFirstProject')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4 sm:space-y-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewClick={() => handleViewProject(project.slug)}
                onEditClick={() => handleEditProjectCard(project.slug)}
                onDeleteClick={() => handleDeleteProjectCard(project.id)}
                currency={userCurrency.currency}
                isVerticalLayout={true}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
