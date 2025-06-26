
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectFormSchema, CreateProjectFormData } from '@/lib/validators/project';
import { useCreateProjectSubmission } from '@/hooks/createProject/useCreateProjectSubmission';
import { ProjectTemplate } from '@/types/projectTemplate';
import { trackTemplateUsed } from '@/lib/analytics';

export const useCreateProjectForm = (templateData?: ProjectTemplate) => {
  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: templateData?.name || '',
      brief: templateData?.brief || '',
      clientEmail: '',
      milestones: templateData?.milestones || [
        {
          title: '',
          description: '',
          price: 0,
          start_date: '',
          end_date: '',
        },
      ],
    },
  });

  const { handleSubmit: handleSubmitProject } = useCreateProjectSubmission();

  const addMilestone = () => {
    const currentMilestones = form.getValues('milestones');
    form.setValue('milestones', [
      ...currentMilestones,
      {
        title: '',
        description: '',
        price: 0,
        start_date: '',
        end_date: '',
      },
    ]);
  };

  const removeMilestone = (index: number) => {
    const currentMilestones = form.getValues('milestones');
    if (currentMilestones.length > 1) {
      form.setValue('milestones', currentMilestones.filter((_, i) => i !== index));
    }
  };

  const loadFromTemplate = (template: ProjectTemplate) => {
    // Track template usage
    trackTemplateUsed(template.id, template.name);
    
    form.setValue('name', template.name);
    form.setValue('brief', template.brief);
    form.setValue('milestones', template.milestones);
  };

  const handleSubmit = async (data: CreateProjectFormData) => {
    await handleSubmitProject(data);
  };

  return {
    form,
    addMilestone,
    removeMilestone,
    loadFromTemplate,
    handleSubmit,
  };
};
