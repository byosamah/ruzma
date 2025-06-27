
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { secureSignOut, logSecurityEvent } from '@/lib/authSecurity';

export const useDashboardActions = (
  deleteProject: (projectId: string) => Promise<boolean>,
  refetchProjects?: () => void
) => {
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    logSecurityEvent('user_sign_out_initiated');
    await secureSignOut();
  }, []);

  const handleEditProject = useCallback((project: any) => {
    navigate(`/edit-project/${project.id}`);
  }, [navigate]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      logSecurityEvent('project_deletion_initiated', { projectId });
      const success = await deleteProject(projectId);
      
      // Refresh the projects list after successful deletion
      if (success && refetchProjects) {
        refetchProjects();
      }
    }
  }, [deleteProject, refetchProjects]);

  return {
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  };
};
