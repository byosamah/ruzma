
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject } from '@/hooks/useProjects';
import { toast } from 'sonner';

export const useClientProject = (token?: string) => {
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!token) {
      setError('No project token provided');
      setIsLoading(false);
      return;
    }
  
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('get-client-project', {
        body: { token },
      });
  
      if (invokeError || !data) {
        console.error('Error fetching project from edge function:', invokeError);
        setError(invokeError?.message || data?.error || 'Project not found');
        return;
      }
  
      const projectData = data;
  
      const typedProject = {
        ...projectData,
        milestones: projectData.milestones.map((milestone: any) => ({
          ...milestone,
          status: milestone.status as 'pending' | 'payment_submitted' | 'approved' | 'rejected'
        }))
      } as DatabaseProject;
  
      setProject(typedProject);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentUpload = async (milestoneId: string, file: File) => {
    console.log('Payment proof upload initiated for milestone:', milestoneId, file);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('milestoneId', milestoneId);

      toast.loading('Uploading payment proof...');
      const { data, error } = await supabase.functions.invoke('upload-client-payment-proof', {
        body: formData,
      });

      toast.dismiss();

      if (error || !data.success) {
        console.error("Upload error:", error, data?.error);
        toast.error(data?.error || 'Failed to upload payment proof.');
        return;
      }

      toast.success('Payment proof uploaded successfully!');
      
      // Refresh project data to show updated status
      await fetchProject();

    } catch (e) {
      toast.dismiss();
      console.error("Upload exception:", e);
      toast.error('An unexpected error occurred during upload.');
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

      // Create a temporary anchor element to trigger download
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

  useEffect(() => {
    setIsLoading(true);
    fetchProject();
  }, [token]);

  return {
    project,
    isLoading,
    error,
    handlePaymentUpload,
    handleDeliverableDownload,
  };
};
