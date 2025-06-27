
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { secureSignOut, logSecurityEvent } from '@/lib/authSecurity';
import { toast } from 'sonner';

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
    console.log('HandleDeleteProject called with ID:', projectId); // Debug log
    
    if (!projectId) {
      toast.error('Project ID is missing');
      return;
    }

    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        logSecurityEvent('project_deletion_initiated', { projectId });
        toast.loading('Deleting project...');
        
        const success = await deleteProject(projectId);
        
        toast.dismiss();
        
        if (success) {
          toast.success('Project deleted successfully');
          // Refresh the projects list after successful deletion
          if (refetchProjects) {
            await refetchProjects();
          }
        } else {
          toast.error('Failed to delete project. Please try again.');
        }
      } catch (error) {
        toast.dismiss();
        console.error('Error deleting project:', error);
        toast.error('An error occurred while deleting the project');
      }
    }
  }, [deleteProject, refetchProjects]);

  return {
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  };
};
