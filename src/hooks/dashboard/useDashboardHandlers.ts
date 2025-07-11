
import { useMemo } from 'react';
import { useDashboardActions } from '@/hooks/dashboard/useDashboardActions';

export const useDashboardHandlers = (
  profile: any, 
  user: any, 
  deleteProject: (projectId: string) => Promise<boolean>,
  refetchProjects?: () => void
) => {
  const displayName = useMemo(() =>
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User", [profile, user]);
  
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
