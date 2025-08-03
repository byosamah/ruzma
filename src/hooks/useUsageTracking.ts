
import { useMemo, useEffect } from 'react';
import { DatabaseProject } from './projectTypes';
import { useUserLimits } from './useUserLimits';
import { useProjectCountSync } from './useProjectCountSync';
import { useT } from '@/lib/i18n';

interface UsageLimits {
  projects: { current: number; max: number; percentage: number; isUnlimited: boolean };
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

    // Use dynamic limits from database or fallback to defaults while loading
    const planLimits = limits || {
      project_limit: userType === 'plus' || userType === 'pro' ? 999999 : 1,
    };
    
    const isUnlimited = planLimits.project_limit >= 999999;
    const projectsPercentage = isUnlimited ? 0 : Math.round((currentProjects / planLimits.project_limit) * 100);

    const canCreateProject = isUnlimited || currentProjects < planLimits.project_limit;

    return {
      projects: {
        current: currentProjects,
        max: planLimits.project_limit,
        percentage: projectsPercentage,
        isUnlimited,
      },
      canCreateProject,
      shouldShowUpgrade: !isUnlimited && projectsPercentage >= 80,
      loading: isLoading,
    };
  }, [userProfile, projects, limits, isLoading, userType]);
};
