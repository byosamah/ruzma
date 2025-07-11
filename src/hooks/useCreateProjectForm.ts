
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { useT } from '@/lib/i18n';
import { useCreateProjectSubmission } from '@/hooks/createProject/useCreateProjectSubmission';
import { createProjectFormSchema, CreateProjectFormData } from '@/lib/validators/project';

export const useCreateProjectForm = (templateData?: any) => {
  const { navigate } = useLanguageNavigation();
  const t = useT();
  const { handleSubmit: submitProject } = useCreateProjectSubmission();

  // Helper function to format template data for form
  const formatTemplateData = (template: any) => {
    if (!template) {
      return {
        name: '',
        brief: '',
        clientEmail: '',
        paymentProofRequired: false,
        milestones: [
          {
            title: '',
            description: '',
            price: 0,
            start_date: '',
            end_date: '',
          },
        ],
      };
    }

    return {
      name: template.name || '',
      brief: template.brief || '',
      clientEmail: '',
      paymentProofRequired: false,
      milestones: template.milestones?.map((milestone: any) => ({
        title: milestone.title || '',
        description: milestone.description || '',
        price: milestone.price || 0,
        start_date: milestone.start_date || '',
        end_date: milestone.end_date || '',
      })) || [
        {
          title: '',
          description: '',
          price: 0,
          start_date: '',
          end_date: '',
        },
      ],
    };
  };

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: formatTemplateData(templateData),
  });

  // Watch for templateData changes and reset form when template data is available
  useEffect(() => {
    console.log('useCreateProjectForm effect triggered. templateData:', templateData);
    if (templateData) {
      console.log('Template data received, resetting form:', templateData);
      const formattedData = formatTemplateData(templateData);
      console.log('Formatted template data for form:', formattedData);
      form.reset(formattedData);
      // Force trigger form re-render
      setTimeout(() => {
        console.log('Form values after reset:', form.getValues());
      }, 100);
    }
  }, [templateData, form]);

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
    console.log('Loading template via loadFromTemplate function:', template);
    const formattedData = formatTemplateData(template);
    console.log('Formatted data in loadFromTemplate:', formattedData);
    form.reset(formattedData);
  };

  const handleSubmit = async (data: CreateProjectFormData) => {
    try {
      await submitProject(data);
    } catch (error) {
      console.error('Error creating project:', error);
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
