
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClientProject, uploadPaymentProof } from '@/api/clientProject';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { toast } from 'sonner';

export const useClientProject = (token?: string) => {
  const queryClient = useQueryClient();
  const userCurrency = useUserCurrency();

  const { data: project, isLoading, error: queryError } = useQuery({
    queryKey: ['clientProject', token],
    queryFn: () => {
      if (!token) throw new Error('No project token provided.');
      return getClientProject(token);
    },
    enabled: !!token,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadPaymentProof,
    onSuccess: () => {
      toast.success('Payment proof uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['clientProject', token] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'An unexpected error occurred during upload.');
    },
    onMutate: () => {
      return toast.loading('Uploading payment proof...');
    },
    onSettled: (_data, _error, _variables, context) => {
      if (context) {
        toast.dismiss(context);
      }
    }
  });

  const handlePaymentUpload = async (milestoneId: string, file: File): Promise<boolean> => {
    if (!token) {
      toast.error("Project token is missing. Cannot upload proof.");
      return false;
    }
    try {
      await uploadMutation.mutateAsync({ milestoneId, file, token });
      return true;
    } catch (e) {
      // Error is already handled by useMutation's onError
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

  const error = queryError ? (queryError as Error).message : null;

  return {
    project: project || null,
    isLoading,
    error,
    handlePaymentUpload,
    handleDeliverableDownload,
    userCurrency: userCurrency.currency,
  };
};
