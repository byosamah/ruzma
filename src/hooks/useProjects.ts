
import { User } from '@supabase/supabase-js';
import { DatabaseProject, DatabaseMilestone } from './projectTypes';
import { ProjectService } from '@/services/projectService';
import { useUserProjects } from './projects/useUserProjects';
import { useUserProfile } from './core/useUserProfile';
import { useMilestoneManager } from './useMilestoneManager';

export const useProjects = (user: User | null) => {
  const { projects, loading, fetchProjects } = useUserProjects(user);
  const { profile: userProfile, fetchUserProfile } = useUserProfile(user, [projects.length]);
  const projectService = new ProjectService(user);

  // Milestone manager
  const milestoneManager = useMilestoneManager({ 
    user, 
    onRefresh: fetchProjects 
  });

  // Milestone actions using the manager
  const updateMilestoneStatus = async (
    milestoneId: string,
    status: 'approved' | 'rejected'
  ) => {
    await milestoneManager.updateMilestoneStatus(projects, milestoneId, status);
  };

  const uploadPaymentProof = async (milestoneId: string, file: File) => {
    await milestoneManager.uploadPaymentProof(milestoneId, file);
  };

  const updateDeliverableLink = async (milestoneId: string, link: string) => {
    await milestoneManager.updateDeliverableLink(milestoneId, link);
  };

  return {
    projects,
    loading,
    userProfile,
    fetchProjects,
    fetchUserProfile,
    createProject: projectService.createProject.bind(projectService),
    updateProject: projectService.updateProject.bind(projectService),
    deleteProject: projectService.deleteProject.bind(projectService),
    updateMilestoneStatus,
    uploadPaymentProof,
    updateDeliverableLink,
  };
};

export type { DatabaseProject, DatabaseMilestone };
