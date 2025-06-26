
import { getClientProject, uploadPaymentProof } from '@/api/clientProject';

export const clientProjectService = {
  getProject: getClientProject,
  uploadPaymentProof: async (projectId: string, token: string, milestoneId: string, file: File) => {
    return uploadPaymentProof({ milestoneId, file, token });
  }
};
