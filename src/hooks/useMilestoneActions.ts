
import { User } from '@supabase/supabase-js';
import { DatabaseProject } from './projectTypes';
import { updateMilestoneStatusAction } from './milestone-actions/updateStatus';
import { updateMilestoneWatermarkAction } from './milestone-actions/updateWatermark';
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
    status: 'pending' | 'payment_submitted' | 'approved' | 'rejected'
  ) => {
    const success = await updateMilestoneStatusAction(user, milestoneId, status);
    if (success) {
      await fetchProjects();
    }
    return success;
  };

  const updateMilestoneWatermark = async (milestoneId: string, watermarkText: string) => {
    const success = await updateMilestoneWatermarkAction(user, milestoneId, watermarkText);
    if (success) {
      await fetchProjects();
    }
    return success;
  };

  const uploadPaymentProof = async (milestoneId: string, file: File) => {
    const success = await uploadPaymentProofAction(milestoneId, file);
    if (success) {
      await fetchProjects();
    }
    return success;
  };

  const uploadDeliverable = async (milestoneId: string, file: File, watermarkText?: string) => {
    const success = await uploadDeliverableAction(user, milestoneId, file, watermarkText);
    if (success) {
      await fetchProjects();
    }
    return success;
  };

  const downloadDeliverable = async (milestoneId: string) => {
    return await downloadDeliverableAction(projects, milestoneId);
  };

  return {
    updateMilestoneStatus,
    uploadPaymentProof,
    uploadDeliverable,
    downloadDeliverable,
    updateMilestoneWatermark,
  };
}
