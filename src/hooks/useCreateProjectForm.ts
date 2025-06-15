
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

  // Helper function to safely map template milestones
  const mapTemplateMilestones = (milestones: any[] = []) => {
    if (!Array.isArray(milestones) || milestones.length === 0) {
      return [{ title: '', description: '', price: 0 }];
    }
    
    return milestones.map((milestone: any) => ({
      title: String(milestone?.title || ''),
      description: String(milestone?.description || ''),
      price: Number(milestone?.price || 0),
    }));
  };

  // Update form when template data changes
  useEffect(() => {
    if (templateData) {
      form.reset({
        name: templateData.name || '',
        brief: templateData.brief || '',
        clientEmail: '',
        milestones: mapTemplateMilestones(templateData.milestones),
      });
    }
  }, [templateData, form]);

  return { form, mapTemplateMilestones };
};
