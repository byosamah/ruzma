
import { useAuth } from '@/hooks/core/useAuth';
import { useDashboardDataQuery } from '@/hooks/dashboard/useDashboardDataQuery';
import { useDashboardHandlers } from '@/hooks/dashboard/useDashboardHandlers';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { ServiceRegistry } from '@/services/core/ServiceRegistry';
import { useUserCurrency } from '@/hooks/useUserCurrency';

export const useDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading: dataLoading, refetch } = useDashboardDataQuery(user);
  
  console.log('useDashboard - user:', user);
  console.log('useDashboard - data:', data);
  console.log('useDashboard - projects from data:', data?.projects);
  
  const userCurrency = useUserCurrency(data?.profile);
  const stats = useDashboardStats(data?.projects || []);

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
