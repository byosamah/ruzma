
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clientProjectService } from '@/services/clientProjectService';
import { DatabaseProject } from '@/hooks/projectTypes';
import { trackClientProjectAccess } from '@/lib/analytics';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { toast } from 'sonner';
import { parseRevisionData, addRevisionRequest, stringifyRevisionData } from '@/lib/revisionUtils';
import { addRevisionRequestAction } from '@/hooks/milestone-actions/updateRevisionData';

export const useClientProject = (token?: string | null, isHybrid?: boolean) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
      const data = await clientProjectService.getProject(token, isHybrid);
      setProject(data);
      
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
    if (!token) {
      throw new Error('Missing access token');
    }

    try {
      const result = await clientProjectService.uploadPaymentProof(projectId!, token, milestoneId, file);
      
      // Refetch project data to get updated milestone status
      if (result) {
        const updatedProject = await clientProjectService.getProject(token, isHybrid);
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
    if (!project || !token) {
      toast.error('Project not available');
      return;
    }

    try {
      // Find the milestone
      const milestone = project.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        toast.error('Milestone not found');
        return;
      }

      // Update revision data
      const currentRevisionData = parseRevisionData(milestone);
      const updatedRevisionData = addRevisionRequest(currentRevisionData, feedback, images);
      const newDeliverableLink = stringifyRevisionData(milestone.deliverable_link, updatedRevisionData);
      
      // Since this is client-side, we'll use a simulated user object
      const success = await addRevisionRequestAction(null, milestoneId, newDeliverableLink);
      
      if (success) {
        // Reload project data
        await loadProject();
        toast.success('Revision request submitted successfully');
      }
    } catch (error) {
      console.error('Error submitting revision request:', error);
      toast.error('Failed to submit revision request');
    }
  };

  return {
    project,
    loading,
    isLoading: loading,
    error,
    uploadPaymentProof,
    handlePaymentUpload,
    handleRevisionRequest,
    userCurrency,
    freelancerCurrency: project?.freelancer_currency || null,
  };
};
