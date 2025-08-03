
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectService } from '@/services/projectService';
import { DatabaseProject } from '@/hooks/projectTypes';
import { trackClientProjectAccess } from '@/lib/analytics';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { toast } from 'sonner';

export const useClientProject = (token?: string | null, isHybrid?: boolean) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsContractApproval, setNeedsContractApproval] = useState(false);
  
  const userCurrency = useUserCurrency(null);

  const loadProject = async () => {
    if (!token) {
      setError('Missing access token');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const projectService = new ProjectService(null);
      const data = await projectService.getClientProject(token, isHybrid);
      setProject(data);
      
      // Check if contract approval is needed
      // Only show contract approval modal if:
      // 1. Contract is required
      // 2. Contract status is 'pending' 
      // 3. Contract has been sent (contract_sent_at is not null)
      const needsApproval = Boolean(
        data.contract_required && 
        data.contract_status === 'pending' && 
        data.contract_sent_at
      );
      setNeedsContractApproval(needsApproval);
      
      // Track client project access
      if (data.id) {
        trackClientProjectAccess(data.id, 'client_link');
      }
      
    } catch (err) {
      console.error('Error fetching client project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [token, isHybrid]);

  const uploadPaymentProof = async (milestoneId: string, file: File) => {
    if (!token || !projectId) {
      throw new Error('Missing access token or project ID');
    }

    try {
      const projectService = new ProjectService(null);
      const result = await projectService.uploadClientPaymentProof(projectId, token, milestoneId, file);
      
      // Refetch project data to get updated milestone status
      if (result) {
        const updatedProject = await projectService.getClientProject(token, isHybrid);
        setProject(updatedProject);
      }
      
      return result;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      throw error;
    }
  };

  const handlePaymentUpload = async (milestoneId: string, file: File) => {
    try {
      await uploadPaymentProof(milestoneId, file);
      return true;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      return false;
    }
  };

  const handleRevisionRequest = async (milestoneId: string, feedback: string, images: string[]) => {
    if (!token) {
      toast.error('Access token not available');
      return;
    }

    try {
      const projectService = new ProjectService(null);
      await projectService.submitRevisionRequest(token, milestoneId, feedback, images);
      // Reload project data to show updated revision count
      await loadProject();
      toast.success('Revision request submitted successfully');
    } catch (error) {
      console.error('Error submitting revision request:', error);
      toast.error('Failed to submit revision request');
    }
  };

  const refetchProject = async () => {
    if (token) {
      await loadProject();
    }
  };

  return {
    project,
    loading,
    isLoading: loading,
    error,
    needsContractApproval,
    uploadPaymentProof,
    handlePaymentUpload,
    handleRevisionRequest,
    userCurrency,
    freelancerCurrency: project?.freelancer_currency || null,
    refetchProject,
  };
};
