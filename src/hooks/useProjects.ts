
import { User } from '@supabase/supabase-js';
import { DatabaseProject, DatabaseMilestone } from './projectTypes';
import { useProjectActions } from './useProjectActions';
import { useMilestoneActions } from './useMilestoneActions';
import { useUserProjects } from './projects/useUserProjects';
import { useUserProfile } from './projects/useUserProfile';

export const useProjects = (user: User | null) => {
  const { projects, loading, fetchProjects } = useUserProjects(user);
  const { userProfile, fetchUserProfile } = useUserProfile(user, projects.length);

  // Import project and milestone actions
  const { createProject, updateProject, deleteProject } = useProjectActions(user);
  const milestoneActions = useMilestoneActions(user, projects, fetchProjects);

  return {
    projects,
    loading,
    userProfile,
    fetchProjects,
    fetchUserProfile,
    createProject,
    updateProject,
    deleteProject,
    ...milestoneActions
  };
};

export type { DatabaseProject, DatabaseMilestone };
