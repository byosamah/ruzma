
import { User } from '@supabase/supabase-js';
import { DatabaseProject, DatabaseMilestone } from './projectTypes';
import { ProjectService } from '@/services/projectService';
import { useUserProjects } from './projects/useUserProjects';
import { useUserProfile } from './core/useUserProfile';
import { updateMilestoneStatus as updateMilestoneStatusAction } from './milestone-actions/updateStatus';
import { uploadPaymentProofAction } from './milestone-actions/uploadPaymentProof';
import { updateDeliverableLinkAction } from './milestone-actions/updateDeliverableLink';

export const useProjects = (user: User | null) => {
  const { projects, loading, fetchProjects } = useUserProjects(user);
  const { profile: userProfile, fetchUserProfile } = useUserProfile(user, [projects.length]);
  const projectService = new ProjectService(user);

  // Milestone actions - directly implemented here instead of separate hook
  const updateMilestoneStatus = async (
    milestoneId: string,
    status: 'approved' | 'rejected'
  ) => {
    const success = await updateMilestoneStatusAction(user, projects, milestoneId, status);
    if (success) {
      await fetchProjects();
    }
  };

  const uploadPaymentProof = async (milestoneId: string, file: File) => {
    const success = await uploadPaymentProofAction(milestoneId, file);
    if (success) {
      await fetchProjects();
    }
  };

  const updateDeliverableLink = async (milestoneId: string, link: string) => {
    const success = await updateDeliverableLinkAction(user, milestoneId, link);
    if (success) {
      await fetchProjects();
    }
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
