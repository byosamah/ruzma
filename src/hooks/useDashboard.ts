
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useProjects } from './useProjects';
import { useUserCurrency } from './useUserCurrency';
import { useDashboardStats } from './dashboard/useDashboardStats';
import { useDisplayName } from './dashboard/useDisplayName';
import { useDashboardHandlers } from './dashboard/useDashboardHandlers';
import { useAuth } from './dashboard/useAuth';
import { useUserProfile } from './dashboard/useUserProfile';
import { useProjectCountSync } from './useProjectCountSync';

export const useDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user);
  const { projects, loading: projectsLoading, deleteProject } = useProjects(user);
  const userCurrency = useUserCurrency(user);
  const stats = useDashboardStats(projects);
  const displayName = useDisplayName(profile, user);
  const handlers = useDashboardHandlers(profile, user, deleteProject);
  const { syncProjectCount } = useProjectCountSync();

  // Sync project count when dashboard loads
  useEffect(() => {
    if (user?.id && profile && projects.length !== (profile.project_count || 0)) {
      console.log('Dashboard: Project count mismatch detected, syncing...');
      syncProjectCount(user.id);
    }
  }, [user?.id, profile?.project_count, projects.length, syncProjectCount, profile]);

  const loading = authLoading || profileLoading || projectsLoading;

  return {
    user,
    profile,
    loading,
    projects,
    userCurrency,
    stats,
    displayName,
    ...handlers,
  };
};
