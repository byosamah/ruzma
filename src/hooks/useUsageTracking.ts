
import { useMemo } from 'react';
import { DatabaseProject } from './projectTypes';

interface UsageLimits {
  projects: { current: number; max: number; percentage: number };
  storage: { current: number; max: number; percentage: number; currentFormatted: string; maxFormatted: string };
  canCreateProject: boolean;
  shouldShowUpgrade: boolean;
}

export const useUsageTracking = (
  userProfile: any,
  projects: DatabaseProject[]
): UsageLimits => {
  return useMemo(() => {
    const userType = userProfile?.user_type || 'free';
    const currentProjects = projects.length;
    const currentStorage = userProfile?.storage_used || 0;

    // Define limits based on plan
    const limits = {
      free: { projects: 1, storage: 524288000 }, // 500MB
      plus: { projects: 3, storage: 10737418240 }, // 10GB
      pro: { projects: 10, storage: 53687091200 }, // 50GB
    };

    const planLimits = limits[userType as keyof typeof limits] || limits.free;
    
    const projectsPercentage = Math.round((currentProjects / planLimits.projects) * 100);
    const storagePercentage = Math.round((currentStorage / planLimits.storage) * 100);

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

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
        max: planLimits.projects,
        percentage: projectsPercentage,
      },
      storage: {
        current: currentStorage,
        max: planLimits.storage,
        percentage: storagePercentage,
        currentFormatted: formatStorage(currentStorage),
        maxFormatted: formatStorage(planLimits.storage),
      },
      canCreateProject: currentProjects < planLimits.projects,
      shouldShowUpgrade: projectsPercentage >= 80 || storagePercentage >= 80,
    };
  }, [userProfile, projects]);
};
