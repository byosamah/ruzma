
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectFormSchema, CreateProjectFormData } from '@/lib/validators/project';

export const useCreateProjectFormData = (templateData?: any) => {
  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: templateData?.name || '',
      brief: templateData?.brief || '',
      clientEmail: '',
      start_date: templateData?.start_date || '',
      end_date: templateData?.end_date || '',
      milestones: templateData?.milestones?.map((milestone: any) => ({
        title: milestone.title || '',
        description: milestone.description || '',
        price: milestone.price || 0,
        start_date: milestone.start_date || '',
        end_date: milestone.end_date || '',
      })) || [{ title: '', description: '', price: 0, start_date: '', end_date: '' }],
    },
  });

  const addMilestone = useCallback(() => {
    const currentMilestones = form.getValues('milestones');
    form.setValue('milestones', [...currentMilestones, { title: '', description: '', price: 0, start_date: '', end_date: '' }]);
  }, [form]);

  const removeMilestone = useCallback((index: number) => {
    const currentMilestones = form.getValues('milestones');
    if (currentMilestones.length > 1) {
      form.setValue('milestones', currentMilestones.filter((_, i) => i !== index));
    }
  }, [form]);

  const loadFromTemplate = useCallback((template: any) => {
    console.log('Loading template:', template);
    
    const templateMilestones = template.milestones?.map((milestone: any) => ({
      title: milestone.title || '',
      description: milestone.description || '',
      price: milestone.price || 0,
      start_date: milestone.start_date || '',
      end_date: milestone.end_date || '',
    })) || [{ title: '', description: '', price: 0, start_date: '', end_date: '' }];

    form.setValue('name', template.name || '');
    form.setValue('brief', template.brief || '');
    form.setValue('start_date', template.start_date || '');
    form.setValue('end_date', template.end_date || '');
    form.setValue('milestones', templateMilestones);
  }, [form]);

  return {
    form,
    addMilestone,
    removeMilestone,
    loadFromTemplate,
  };
};
