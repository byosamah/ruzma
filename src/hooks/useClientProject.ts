
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject } from '@/hooks/projectTypes';
import { toast } from 'sonner';

export const useClientProject = (token?: string) => {
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!token) {
      setError('No project token provided.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('get-client-project', {
        body: { token },
      });

      if (invokeError) throw invokeError;
      if (!data || data.error) {
        throw new Error(data?.error || 'Project not found.');
      }

      const projectData = data;
      const typedProject: DatabaseProject = {
        ...projectData,
        milestones: projectData.milestones.map((milestone: any) => ({
          ...milestone,
          status: milestone.status as 'pending' | 'payment_submitted' | 'approved' | 'rejected',
        })),
      };
      setProject(typedProject);
    } catch (err: any) {
      console.error('Error fetching client project:', err);
      setError(err.message || 'Failed to load project details.');
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handlePaymentUpload = async (milestoneId: string, file: File) => {
    if (!token) {
        toast.error("Project token is missing. Cannot upload proof.");
        return false;
    }
    toast.loading('Uploading payment proof...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('milestoneId', milestoneId);
      formData.append('token', token);

      const { data, error: invokeError } = await supabase.functions.invoke('upload-client-payment-proof', {
        body: formData,
      });

      toast.dismiss();

      if (invokeError) {
        console.error('Edge function invocation error:', invokeError);
        toast.error(`Upload failed: ${invokeError.message}`);
        return false;
      }

      if (!data?.success) {
        console.error('Edge function returned an error:', data?.error);
        toast.error(data?.error || 'Failed to upload payment proof.');
        return false;
      }
      
      toast.success('Payment proof uploaded successfully!');
      await fetchProject(); // Refresh data
      return true;
    } catch (e: any) {
      toast.dismiss();
      console.error("Upload exception:", e);
      toast.error(e.message || 'An unexpected error occurred during upload.');
      return false;
    }
  };

  const handleDeliverableDownload = async (milestoneId: string) => {
    try {
      const milestone = project?.milestones.find(m => m.id === milestoneId);
      
      if (!milestone) {
        toast.error('Milestone not found');
        return;
      }

      if (milestone.status !== 'approved') {
        toast.error('Payment must be approved before downloading');
        return;
      }

      if (!milestone.deliverable_name || !milestone.deliverable_url) {
        toast.error('No deliverable available');
        return;
      }

      const link = document.createElement('a');
      link.href = milestone.deliverable_url;
      link.download = milestone.deliverable_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloaded ${milestone.deliverable_name}`);
    } catch (error) {
      console.error('Error downloading deliverable:', error);
      toast.error('Failed to download deliverable');
    }
  };

  return {
    project,
    isLoading,
    error,
    handlePaymentUpload,
    handleDeliverableDownload,
  };
};
