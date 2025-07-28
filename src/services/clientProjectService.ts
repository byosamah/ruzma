
import { getClientProject, uploadPaymentProof } from '@/api/clientProject';
import { supabase } from '@/integrations/supabase/client';

export const clientProjectService = {
  getProject: getClientProject,
  uploadPaymentProof: async (projectId: string, token: string, milestoneId: string, file: File) => {
    return uploadPaymentProof({ milestoneId, file, token });
  },
  submitRevisionRequest: async (token: string, milestoneId: string, feedback: string, images: string[]) => {
    const { data, error } = await supabase.functions.invoke('submit-revision-request', {
      body: {
        token,
        milestoneId,
        feedback,
        images
      }
    });

    if (error) {
      console.error('Error submitting revision request:', error);
      throw new Error('Failed to submit revision request');
    }

    return data;
  }
};
