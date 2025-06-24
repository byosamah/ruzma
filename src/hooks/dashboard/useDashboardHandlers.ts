
import { useDisplayName } from '@/hooks/dashboard/useDisplayName';
import { useDashboardActions } from '@/hooks/dashboard/useDashboardActions';

export const useDashboardHandlers = (profile: any, user: any, deleteProject: (projectId: string) => Promise<boolean>) => {
  const displayName = useDisplayName(profile, user);
  const { handleSignOut, handleEditProject, handleDeleteProject } = useDashboardActions(deleteProject);

  return {
    displayName,
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  };
};
