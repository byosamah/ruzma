
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, CreateProjectFormData } from '@/lib/validators/project';

interface TemplateData {
  name?: string;
  brief?: string;
  milestones?: Array<{
    title?: string;
    description?: string;
    price?: number;
  }>;
}

export const useCreateProjectForm = (templateData?: TemplateData) => {
  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      brief: '',
      clientEmail: '',
      milestones: [{ title: '', description: '', price: 0 }],
    },
    mode: 'onChange',
  });

  // Update form when template data changes
  useEffect(() => {
    if (templateData) {
      const mappedMilestones = (templateData.milestones || []).map(m => ({
        title: m.title || '',
        description: m.description || '',
        price: m.price || 0,
      }));

      // Ensure there's at least one milestone for the form array
      if (mappedMilestones.length === 0) {
        mappedMilestones.push({ title: '', description: '', price: 0 });
      }

      form.reset({
        name: templateData.name || '',
        brief: templateData.brief || '',
        clientEmail: '',
        milestones: mappedMilestones,
      });
    }
  }, [templateData, form]);

  return { form };
};
