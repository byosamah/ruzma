
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject } from '@/hooks/projectTypes';

export const getClientProject = async (token: string, isHybrid?: boolean): Promise<DatabaseProject> => {
  console.log('Fetching project with token:', token, 'isHybrid:', isHybrid);
  
  const { data, error: invokeError } = await supabase.functions.invoke('get-client-project', {
    body: { token, isHybrid },
  });

  console.log('Edge function response:', { data, invokeError });

  if (invokeError) {
    console.error('Edge function invocation error:', invokeError);
    throw new Error(`Failed to connect to server: ${invokeError.message}`);
  }

  if (!data) {
    throw new Error('No data received from server');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  const typedProject: DatabaseProject = {
    ...data,
    milestones: (data.milestones || []).map((milestone: any) => ({
      ...milestone,
      status: milestone.status as 'pending' | 'payment_submitted' | 'approved' | 'rejected',
    })),
    // Include freelancer's currency if available from the response
    freelancer_currency: data.freelancer_currency,
  };
  
  console.log('Successfully fetched project:', typedProject);
  return typedProject;
};

type UploadPaymentProofParams = {
  milestoneId: string;
  file: File;
  token: string;
};

export const uploadPaymentProof = async ({ milestoneId, file, token }: UploadPaymentProofParams): Promise<boolean> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('milestoneId', milestoneId);
  formData.append('token', token);

  const { data, error: invokeError } = await supabase.functions.invoke('upload-client-payment-proof', {
    body: formData,
  });

  if (invokeError) {
    console.error('Edge function invocation error:', invokeError);
    throw new Error(`Upload failed: ${invokeError.message}`);
  }

  if (!data?.success) {
    console.error('Edge function returned an error:', data?.error);
    throw new Error(data?.error || 'Failed to upload payment proof.');
  }
  
  return true;
};
