
import { useProjects } from '@/hooks/useProjects';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useUserProfile } from '@/hooks/dashboard/useUserProfile';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useDisplayName } from '@/hooks/dashboard/useDisplayName';
import { useDashboardActions } from '@/hooks/dashboard/useDashboardActions';

export const useDashboard = () => {
  const { user, loading: authLoading, authChecked } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user);
  const { projects, loading: projectsLoading, deleteProject } = useProjects(user);
  const userCurrency = useUserCurrency(user);
  const stats = useDashboardStats(projects);
  const displayName = useDisplayName(profile, user);
  const { handleSignOut, handleEditProject, handleDeleteProject } = useDashboardActions(deleteProject);

  const loading = authLoading || profileLoading || projectsLoading;

  return {
    user,
    profile,
    loading,
    projects,
    userCurrency,
    stats,
    displayName,
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  };
};
