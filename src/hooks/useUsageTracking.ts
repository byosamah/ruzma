
import { useMemo } from 'react';
import { DatabaseProject } from './projectTypes';
import { useUserLimits } from './useUserLimits';

interface UsageLimits {
  projects: { current: number; max: number; percentage: number };
  storage: { current: number; max: number; percentage: number; currentFormatted: string; maxFormatted: string };
  canCreateProject: boolean;
  shouldShowUpgrade: boolean;
  loading: boolean;
}

export const useUsageTracking = (
  userProfile: any,
  projects: DatabaseProject[]
): UsageLimits => {
  const userType = userProfile?.user_type || 'free';
  const { data: limits, isLoading } = useUserLimits(userType);

  return useMemo(() => {
    const currentProjects = projects.length;
    const currentStorage = userProfile?.storage_used || 0;

    // Use dynamic limits from database or fallback to defaults while loading
    const planLimits = limits || {
      project_limit: userType === 'plus' ? 3 : userType === 'pro' ? 10 : 1,
      storage_limit_bytes: userType === 'plus' ? 10737418240 : userType === 'pro' ? 53687091200 : 524288000
    };
    
    const projectsPercentage = Math.round((currentProjects / planLimits.project_limit) * 100);
    const storagePercentage = Math.round((currentStorage / planLimits.storage_limit_bytes) * 100);

    const formatStorage = (bytes: number) => {
      if (bytes >= 1073741824) { // 1GB
        return `${(bytes / 1073741824).toFixed(1)} GB`;
      } else {
        return `${(bytes / 1048576).toFixed(0)} MB`;
      }
    };

    return {
      projects: {
        current: currentProjects,
        max: planLimits.project_limit,
        percentage: projectsPercentage,
      },
      storage: {
        current: currentStorage,
        max: planLimits.storage_limit_bytes,
        percentage: storagePercentage,
        currentFormatted: formatStorage(currentStorage),
        maxFormatted: formatStorage(planLimits.storage_limit_bytes),
      },
      canCreateProject: currentProjects < planLimits.project_limit,
      shouldShowUpgrade: projectsPercentage >= 80 || storagePercentage >= 80,
      loading: isLoading,
    };
  }, [userProfile, projects, limits, isLoading, userType]);
};
