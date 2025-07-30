
import { useMemo, useEffect } from 'react';
import { DatabaseProject } from './projectTypes';
import { useUserLimits } from './useUserLimits';
import { useProjectCountSync } from './useProjectCountSync';
import { useT } from '@/lib/i18n';

interface UsageLimits {
  projects: { current: number; max: number; percentage: number; isUnlimited: boolean };
  storage: { current: number; max: number; percentage: number; currentFormatted: string; maxFormatted: string };
  canCreateProject: boolean;
  shouldShowUpgrade: boolean;
  loading: boolean;
}

export const useUsageTracking = (
  userProfile: any,
  projects: DatabaseProject[]
): UsageLimits => {
  const t = useT();
  const userType = userProfile?.user_type || 'free';
  const { data: limits, isLoading } = useUserLimits(userType);
  const { syncProjectCount } = useProjectCountSync();

  // Sync project count when there's a mismatch
  useEffect(() => {
    if (userProfile?.id && projects.length !== (userProfile.project_count || 0)) {
      console.log('Project count mismatch detected, syncing...');
      syncProjectCount(userProfile.id);
    }
  }, [userProfile?.id, userProfile?.project_count, projects.length, syncProjectCount]);

  return useMemo(() => {
    // Use actual project count from the projects array as the source of truth
    const currentProjects = projects.length;
    const currentStorage = userProfile?.storage_used || 0;

    // Use dynamic limits from database or fallback to defaults while loading
    const planLimits = limits || {
      project_limit: userType === 'plus' || userType === 'pro' ? 999999 : 1,
      storage_limit_bytes: userType === 'plus' ? 10737418240 : userType === 'pro' ? 53687091200 : 524288000
    };
    
    const isUnlimited = planLimits.project_limit >= 999999;
    const projectsPercentage = isUnlimited ? 0 : Math.round((currentProjects / planLimits.project_limit) * 100);
    const storagePercentage = Math.round((currentStorage / planLimits.storage_limit_bytes) * 100);

    const formatStorage = (bytes: number) => {
      if (bytes >= 1073741824) { // 1GB
        return `${(bytes / 1073741824).toFixed(1)} ${t('gb')}`;
      } else {
        return `${(bytes / 1048576).toFixed(0)} ${t('mb')}`;
      }
    };

    const canCreateProject = isUnlimited || currentProjects < planLimits.project_limit;

    // Remove debug logging to improve performance
    // console.log('Usage tracking debug:', {
    //   currentProjects,
    //   maxProjects: planLimits.project_limit,
    //   profileProjectCount: userProfile?.project_count,
    //   canCreateProject,
    //   userType,
    //   isUnlimited
    // });

    return {
      projects: {
        current: currentProjects,
        max: planLimits.project_limit,
        percentage: projectsPercentage,
        isUnlimited,
      },
      storage: {
        current: currentStorage,
        max: planLimits.storage_limit_bytes,
        percentage: storagePercentage,
        currentFormatted: formatStorage(currentStorage),
        maxFormatted: formatStorage(planLimits.storage_limit_bytes),
      },
      canCreateProject,
      shouldShowUpgrade: (!isUnlimited && projectsPercentage >= 80) || storagePercentage >= 80,
      loading: isLoading,
    };
  }, [userProfile, projects, limits, isLoading, userType, t]);
};
