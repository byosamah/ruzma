
import { useAuth } from '@/hooks/core/useAuth';
import { useDashboardDataQuery } from '@/hooks/dashboard/useDashboardDataQuery';
import { useDashboardHandlers } from '@/hooks/dashboard/useDashboardHandlers';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { ProjectService } from '@/services/projectService';
import { useUserCurrency } from '@/hooks/useUserCurrency';

export const useDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading: dataLoading, refetch } = useDashboardDataQuery(user);
  const projectService = new ProjectService(user);
  const userCurrency = useUserCurrency(data?.profile);
  const stats = useDashboardStats(data?.projects || []);

  const {
    displayName,
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  } = useDashboardHandlers(data?.profile, user, projectService.deleteProject.bind(projectService), refetch);

  const loading = authLoading || dataLoading;

  return {
    user,
    profile: data?.profile,
    projects: data?.projects || [],
    userCurrency,
    stats,
    loading,
    displayName,
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  };
};
