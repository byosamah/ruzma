
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clientProjectService } from '@/services/clientProjectService';
import { DatabaseProject } from '@/hooks/projectTypes';
import { trackClientProjectAccess } from '@/lib/analytics';

export const useClientProject = () => {
  const { projectId, token } = useParams<{ projectId: string; token: string }>();
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || !token) {
        setError('Missing project ID or access token');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await clientProjectService.getProject(projectId, token);
        setProject(data);
        
        // Track client project access
        trackClientProjectAccess(projectId, 'client_link');
        
      } catch (err) {
        console.error('Error fetching client project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, token]);

  const uploadPaymentProof = async (milestoneId: string, file: File) => {
    if (!projectId || !token) {
      throw new Error('Missing project ID or access token');
    }

    return clientProjectService.uploadPaymentProof(projectId, token, milestoneId, file);
  };

  return {
    project,
    loading,
    error,
    uploadPaymentProof,
  };
};
