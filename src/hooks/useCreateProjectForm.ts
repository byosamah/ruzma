
import { useCreateProjectFormData } from './createProject/useCreateProjectFormData';
import { useCreateProjectSubmission } from './createProject/useCreateProjectSubmission';

export const useCreateProjectForm = (templateData?: any) => {
  const { form, addMilestone, removeMilestone, loadFromTemplate } = useCreateProjectFormData(templateData);
  const { handleSubmit } = useCreateProjectSubmission();

  return {
    form,
    addMilestone,
    removeMilestone,
    loadFromTemplate,
    handleSubmit,
  };
};
