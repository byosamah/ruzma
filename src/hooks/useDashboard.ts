
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useDashboardHandlers } from '@/hooks/dashboard/useDashboardHandlers';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useProjectActions } from '@/hooks/useProjectActions';
import { useUserCurrency } from '@/hooks/useUserCurrency';

export const useDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { projects, profile, loading: dataLoading, refetch } = useDashboardData(user);
  const { deleteProject } = useProjectActions(user);
  const userCurrency = useUserCurrency(profile);
  const stats = useDashboardStats(projects);

  const {
    displayName,
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  } = useDashboardHandlers(profile, user, deleteProject, refetch);

  const loading = authLoading || dataLoading;

  return {
    user,
    profile,
    projects,
    userCurrency,
    stats,
    loading,
    displayName,
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  };
};
