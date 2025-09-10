
import { useAuth } from '@/hooks/core/useAuth';
import { useDashboardDataQuery } from '@/hooks/dashboard/useDashboardDataQuery';
import { useDashboardHandlers } from '@/hooks/dashboard/useDashboardHandlers';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { ServiceRegistry } from '@/services/core/ServiceRegistry';
import { useUserCurrency } from '@/hooks/useUserCurrency';

export const useDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading: dataLoading, refetch } = useDashboardDataQuery(user);
  
  
  const userCurrency = useUserCurrency(data?.profile);
  const stats = useDashboardStats(data?.projects || [], userCurrency.currency);

  const projectService = ServiceRegistry.getInstance().getProjectService(user);
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
