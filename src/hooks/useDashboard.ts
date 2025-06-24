
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useDashboardHandlers } from '@/hooks/dashboard/useDashboardHandlers';

export const useDashboard = () => {
  const {
    user,
    profile,
    loading,
    projects,
    userCurrency,
    stats,
    deleteProject,
  } = useDashboardData();

  const {
    displayName,
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  } = useDashboardHandlers(profile, user, deleteProject);

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
