
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createProjectFormSchema, CreateProjectFormData } from '@/lib/validators/project';
import { useT } from '@/lib/i18n';
import { generateSlug } from '@/lib/slugUtils';

export const useCreateProjectForm = (templateData?: any) => {
  const navigate = useNavigate();
  const t = useT();

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: templateData?.name || '',
      brief: templateData?.brief || '',
      clientEmail: '',
      paymentProofRequired: false,
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

  const loadFromTemplate = (template: any) => {
    form.setValue('name', template.name);
    form.setValue('brief', template.brief);
    form.setValue('milestones', template.milestones);
    // Keep paymentProofRequired as false when loading from template
    form.setValue('paymentProofRequired', false);
  };

  const handleSubmit = async (data: CreateProjectFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('mustBeLoggedIn'));
        return;
      }

      const slug = generateSlug(data.name);

      // Look up client by email to get client_id
      let clientId: string | null = null;
      
      if (data.clientEmail) {
        const { data: existingClient, error: clientLookupError } = await supabase
          .from('clients')
          .select('id')
          .eq('email', data.clientEmail)
          .eq('user_id', user.id)
          .maybeSingle();

        if (clientLookupError) {
          console.error('Error looking up client:', clientLookupError);
        } else if (existingClient) {
          clientId = existingClient.id;
        }
      }

      // Create the project with proper client linking
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: data.name,
          brief: data.brief,
          client_email: data.clientEmail || null,
          client_id: clientId, // This is the key fix - properly set client_id
          payment_proof_required: data.paymentProofRequired,
          user_id: user.id,
          slug: slug,
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        toast.error(t('failedToCreateProject'));
        return;
      }

      // Create milestones
      const milestonesToInsert = data.milestones.map((milestone) => ({
        project_id: project.id,
        title: milestone.title,
        description: milestone.description,
        price: milestone.price,
        start_date: milestone.start_date || null,
        end_date: milestone.end_date || null,
        status: 'pending',
      }));

      const { error: milestonesError } = await supabase
        .from('milestones')
        .insert(milestonesToInsert);

      if (milestonesError) {
        console.error('Error creating milestones:', milestonesError);
        toast.error(t('failedToCreateMilestones'));
        return;
      }

      // Update project count
      await supabase.rpc('update_project_count', {
        _user_id: user.id,
        _count_change: 1,
      });

      toast.success(t('projectCreatedSuccessfully'));
      navigate('/dashboard');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error(t('unexpectedError'));
    }
  };

  return {
    form,
    addMilestone,
    removeMilestone,
    loadFromTemplate,
    handleSubmit,
  };
};
