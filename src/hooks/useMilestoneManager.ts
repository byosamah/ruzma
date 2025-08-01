import { useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { DatabaseProject } from '@/hooks/projectTypes';
import { MilestoneService } from '@/services/milestoneService';
import { supabase } from '@/integrations/supabase/client';

interface UseMilestoneManagerOptions {
  user: User | null;
  onRefresh?: () => void;
}

export const useMilestoneManager = ({ user, onRefresh }: UseMilestoneManagerOptions) => {
  const service = new MilestoneService(user);

  // Status Management
  const updateMilestoneStatus = useCallback(async (
    projects: DatabaseProject[],
    milestoneId: string,
    status: 'approved' | 'rejected'
  ): Promise<boolean> => {
    const result = await service.updateMilestoneStatus(projects, milestoneId, status);
    if (result && onRefresh) {
      onRefresh();
    }
    return result;
  }, [service, onRefresh]);

  const updateMilestoneStatusGeneral = useCallback(async (
    milestoneId: string,
    status: 'pending' | 'payment_submitted' | 'approved' | 'rejected'
  ): Promise<boolean> => {
    const result = await service.updateMilestoneStatusGeneral(milestoneId, status);
    if (result && onRefresh) {
      onRefresh();
    }
    return result;
  }, [service, onRefresh]);

  // File Operations
  const uploadPaymentProof = useCallback(async (
    milestoneId: string,
    file: File
  ): Promise<boolean> => {
    const result = await service.uploadPaymentProof(milestoneId, file);
    if (result && onRefresh) {
      onRefresh();
    }
    return result;
  }, [service, onRefresh]);

  const uploadDeliverable = useCallback(async (
    milestoneId: string,
    file: File
  ): Promise<boolean> => {
    const result = await service.uploadDeliverable(milestoneId, file);
    if (result && onRefresh) {
      onRefresh();
    }
    return result;
  }, [service, onRefresh]);

  const downloadDeliverable = useCallback(async (
    projects: DatabaseProject[],
    milestoneId: string,
    paymentProofRequired: boolean = true
  ): Promise<boolean> => {
    return await service.downloadDeliverable(projects, milestoneId, paymentProofRequired);
  }, [service]);

  // Link Management
  const updateDeliverableLink = useCallback(async (
    milestoneId: string,
    link: string
  ): Promise<boolean> => {
    const result = await service.updateDeliverableLink(milestoneId, link);
    if (result && onRefresh) {
      onRefresh();
    }
    return result;
  }, [service, onRefresh]);

  // Revision Management
  const updateRevisionData = useCallback(async (
    milestoneId: string,
    newDeliverableLink: string
  ): Promise<boolean> => {
    const result = await service.updateRevisionData(milestoneId, newDeliverableLink);
    if (result && onRefresh) {
      onRefresh();
    }
    return result;
  }, [service, onRefresh]);

  const addRevisionRequest = useCallback(async (
    milestoneId: string,
    newDeliverableLink: string
  ): Promise<boolean> => {
    const result = await service.addRevisionRequest(milestoneId, newDeliverableLink);
    if (result && onRefresh) {
      onRefresh();
    }
    return result;
  }, [service, onRefresh]);

  // Client-specific revision request handler
  const addRevisionRequestClient = useCallback(async (
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

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error submitting revision request:', error);
      throw error;
    }
  }, [onRefresh]);

  return {
    // Status Management
    updateMilestoneStatus,
    updateMilestoneStatusGeneral,
    
    // File Operations
    uploadPaymentProof,
    uploadDeliverable,
    downloadDeliverable,
    
    // Link Management
    updateDeliverableLink,
    
    // Revision Management
    updateRevisionData,
    addRevisionRequest,
    addRevisionRequestClient,
  };
};