
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createProjectSchema, CreateProjectFormData } from '@/lib/validators/project';

export const useCreateProjectForm = (templateData?: any) => {
  const navigate = useNavigate();
  
  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: templateData?.name || '',
      brief: templateData?.brief || '',
      clientEmail: '',
      milestones: templateData?.milestones?.map((milestone: any) => ({
        title: milestone.title || '',
        description: milestone.description || '',
        price: milestone.price || 0,
      })) || [{ title: '', description: '', price: 0 }],
    },
  });

  const addMilestone = useCallback(() => {
    const currentMilestones = form.getValues('milestones');
    form.setValue('milestones', [...currentMilestones, { title: '', description: '', price: 0 }]);
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
    })) || [{ title: '', description: '', price: 0 }];

    form.setValue('name', template.name || '');
    form.setValue('brief', template.brief || '');
    form.setValue('milestones', templateMilestones);
  }, [form]);

  const handleSubmit = useCallback(async (data: CreateProjectFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create a project');
        return;
      }

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: data.name,
          brief: data.brief,
          client_email: data.clientEmail,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create milestones
      const milestoneInserts = data.milestones.map((milestone) => ({
        project_id: project.id,
        title: milestone.title,
        description: milestone.description,
        price: milestone.price,
        status: 'pending' as const,
      }));

      const { error: milestonesError } = await supabase
        .from('milestones')
        .insert(milestoneInserts);

      if (milestonesError) throw milestonesError;

      toast.success('Project created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    }
  }, [navigate]);

  return {
    form,
    addMilestone,
    removeMilestone,
    loadFromTemplate,
    handleSubmit,
  };
};
