
import { User } from '@supabase/supabase-js';
import { DatabaseProject } from './projectTypes';
import { updateMilestoneStatus as updateMilestoneStatusAction } from './milestone-actions/updateStatus';
import { uploadPaymentProofAction } from './milestone-actions/uploadPaymentProof';
import { uploadDeliverableAction } from './milestone-actions/uploadDeliverable';
import { downloadDeliverableAction } from './milestone-actions/downloadDeliverable';

export function useMilestoneActions(
  user: User | null,
  projects: DatabaseProject[],
  fetchProjects: () => Promise<void>
) {
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

  const uploadDeliverable = async (milestoneId: string, file: File) => {
    const success = await uploadDeliverableAction(user, milestoneId, file);
    if (success) {
      await fetchProjects();
    }
  };

  const downloadDeliverable = async (milestoneId: string) => {
    await downloadDeliverableAction(projects, milestoneId);
  };

  return {
    updateMilestoneStatus,
    uploadPaymentProof,
    uploadDeliverable,
    downloadDeliverable,
  };
}
