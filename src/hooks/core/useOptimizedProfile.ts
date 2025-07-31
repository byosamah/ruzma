// Optimized hook that combines auth and profile for better performance
import { useAuth } from './useAuth';
import { useProfileQuery } from './useProfileQuery';

export const useOptimizedProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading, error } = useProfileQuery(user);

  return {
    user,
    profile,
    loading: authLoading || profileLoading,
    error,
    isAuthenticated: !!user,
    hasProfile: !!profile,
  };
};