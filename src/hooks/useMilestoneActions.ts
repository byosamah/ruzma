
import { User } from '@supabase/supabase-js';
import { DatabaseProject } from './projectTypes';
import { updateMilestoneStatus as updateMilestoneStatusAction } from './milestone-actions/updateStatus';
import { uploadPaymentProofAction } from './milestone-actions/uploadPaymentProof';
import { updateDeliverableLinkAction } from './milestone-actions/updateDeliverableLink';

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

  const updateDeliverableLink = async (milestoneId: string, link: string) => {
    const success = await updateDeliverableLinkAction(user, milestoneId, link);
    if (success) {
      await fetchProjects();
    }
  };

  return {
    updateMilestoneStatus,
    uploadPaymentProof,
    updateDeliverableLink,
  };
}
