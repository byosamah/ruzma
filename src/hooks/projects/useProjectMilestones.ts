import { User } from '@supabase/supabase-js';
import { ProjectService } from '@/services/projectService';
import { DatabaseProject } from '@/hooks/projectTypes';
import { supabase } from '@/integrations/supabase/client';

interface UseProjectMilestonesOptions {
  user: User | null;
}

export const useProjectMilestones = (options: UseProjectMilestonesOptions) => {
  const { user } = options;
  const projectService = new ProjectService(user);

  const updateMilestoneStatus = async (
    projects: DatabaseProject[],
    milestoneId: string,
    status: 'approved' | 'rejected'
  ): Promise<boolean> => {
    return await projectService.updateMilestoneStatus(projects, milestoneId, status);
  };

  const updateMilestoneStatusGeneral = async (
    milestoneId: string,
    status: 'pending' | 'payment_submitted' | 'approved' | 'rejected'
  ): Promise<boolean> => {
    return await projectService.updateMilestoneStatusGeneral(milestoneId, status);
  };

  const uploadPaymentProof = async (milestoneId: string, file: File): Promise<boolean> => {
    return await projectService.uploadPaymentProof(milestoneId, file);
  };

  const uploadDeliverable = async (milestoneId: string, file: File): Promise<boolean> => {
    return await projectService.uploadDeliverable(milestoneId, file);
  };

  const downloadDeliverable = async (
    projects: DatabaseProject[],
    milestoneId: string,
    paymentProofRequired: boolean = true
  ): Promise<boolean> => {
    return await projectService.downloadDeliverable(projects, milestoneId, paymentProofRequired);
  };

  const updateDeliverableLink = async (milestoneId: string, link: string): Promise<boolean> => {
    return await projectService.updateDeliverableLink(milestoneId, link);
  };

  const updateRevisionData = async (milestoneId: string, newDeliverableLink: string): Promise<boolean> => {
    return await projectService.updateRevisionData(milestoneId, newDeliverableLink);
  };

  const addRevisionRequest = async (milestoneId: string, newDeliverableLink: string): Promise<boolean> => {
    return await projectService.addRevisionRequest(milestoneId, newDeliverableLink);
  };

  // Client-specific revision request handler
  const addRevisionRequestClient = async (
    milestoneId: string,
    feedback: string,
    images: string[]
  ): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('submit-revision-request', {
        body: {
          milestoneId,
          feedback,
          images
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    updateMilestoneStatus,
    updateMilestoneStatusGeneral,
    uploadPaymentProof,
    uploadDeliverable,
    downloadDeliverable,
    updateDeliverableLink,
    updateRevisionData,
    addRevisionRequest,
    addRevisionRequestClient,
  };
};