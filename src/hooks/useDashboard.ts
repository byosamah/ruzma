
import { useAuth } from '@/hooks/core/useAuth';
import { useDashboardDataQuery } from '@/hooks/dashboard/useDashboardDataQuery';
import { useDashboardHandlers } from '@/hooks/dashboard/useDashboardHandlers';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { ProjectService } from '@/services/projectService';
import { useUserCurrency } from '@/hooks/useUserCurrency';

export const useDashboard = () => {
  console.log('useDashboard hook initializing...');
  
  const { user, loading: authLoading } = useAuth();
  console.log('useAuth completed, user:', !!user);
  
  const { data, isLoading: dataLoading, refetch } = useDashboardDataQuery(user);
  console.log('useDashboardDataQuery completed, data:', !!data);
  
  const projectService = new ProjectService(user);
  console.log('ProjectService created');
  
  const userCurrency = useUserCurrency(data?.profile);
  console.log('useUserCurrency completed');
  
  const stats = useDashboardStats(data?.projects || []);
  console.log('useDashboardStats completed');

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
