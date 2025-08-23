
import { useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { useDashboardActions } from '@/hooks/dashboard/useDashboardActions';

interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
}

export const useDashboardHandlers = (
  profile: UserProfile | null | undefined, 
  user: User | null, 
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
