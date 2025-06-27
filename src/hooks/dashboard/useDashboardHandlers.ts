
import { useDisplayName } from '@/hooks/dashboard/useDisplayName';
import { useDashboardActions } from '@/hooks/dashboard/useDashboardActions';

export const useDashboardHandlers = (
  profile: any, 
  user: any, 
  deleteProject: (projectId: string) => Promise<boolean>,
  refetchProjects?: () => void
) => {
  const displayName = useDisplayName(profile, user);
  const { handleSignOut, handleEditProject, handleDeleteProject } = useDashboardActions(
    deleteProject,
    refetchProjects
  );

  return {
    displayName,
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  };
};
