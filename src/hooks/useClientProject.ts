
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clientProjectService } from '@/services/clientProjectService';
import { DatabaseProject } from '@/hooks/projectTypes';
import { trackClientProjectAccess } from '@/lib/analytics';
import { useUserCurrency } from '@/hooks/useUserCurrency';

export const useClientProject = (token?: string | null, isHybrid?: boolean) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const userCurrency = useUserCurrency(null);

  useEffect(() => {
    const fetchProject = async () => {
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

    fetchProject();
  }, [token, isHybrid]);

  const uploadPaymentProof = async (milestoneId: string, file: File) => {
    if (!token || !projectId) {
      throw new Error('Missing project ID or access token');
    }

    return clientProjectService.uploadPaymentProof(projectId, token, milestoneId, file);
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

  const handleDeliverableDownload = (milestoneId: string) => {
    console.log('Download deliverable:', milestoneId);
  };

  return {
    project,
    loading,
    isLoading: loading,
    error,
    uploadPaymentProof,
    handlePaymentUpload,
    handleDeliverableDownload,
    userCurrency,
    freelancerCurrency: project?.freelancer_currency || null,
  };
};
