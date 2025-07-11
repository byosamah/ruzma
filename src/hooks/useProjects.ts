
import { User } from '@supabase/supabase-js';
import { DatabaseProject, DatabaseMilestone } from '@/types/shared';
import { useProjectCRUD } from './projects/useProjectCRUD';
import { useUserProjects } from './projects/useUserProjects';
import { useUserProfile } from './projects/useUserProfile';
import { updateMilestoneStatus as updateMilestoneStatusAction } from './milestone-actions/updateStatus';
import { uploadPaymentProofAction } from './milestone-actions/uploadPaymentProof';
import { updateDeliverableLinkAction } from './milestone-actions/updateDeliverableLink';

export const useProjects = (user: User | null) => {
  const { projects, loading, fetchProjects } = useUserProjects(user);
  const { userProfile, fetchUserProfile } = useUserProfile(user, projects.length);

  // Import project CRUD actions directly
  const { createProject, updateProject, deleteProject } = useProjectCRUD(user);

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
    createProject,
    updateProject,
    deleteProject,
    updateMilestoneStatus,
    uploadPaymentProof,
    updateDeliverableLink,
  };
};

export type { DatabaseProject, DatabaseMilestone };
