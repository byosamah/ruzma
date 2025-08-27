import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectFormSchema, CreateProjectFormData } from '@/lib/validators/project';
import { ProjectTemplate } from '@/types/projectTemplate';
import { DatabaseProject, DatabaseMilestone } from '@/hooks/projectTypes';

interface UseProjectFormOptions {
  mode: 'create' | 'edit';
  templateData?: ProjectTemplate;
  existingProject?: DatabaseProject;
}

export const useProjectForm = (options: UseProjectFormOptions) => {
  const { mode, templateData, existingProject } = options;

  // Helper function to format data for form
  const formatDataForForm = (data?: ProjectTemplate | DatabaseProject) => {
    if (!data) {
      return {
        name: '',
        brief: '',
        clientEmail: '',
        paymentProofRequired: false,
        contractRequired: false,
        contractTerms: '',
        paymentTerms: '',
        projectScope: '',
        revisionPolicy: '',
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

    // Handle both template and project data
    const isProject = 'slug' in data;
    
    return {
      name: data.name || '',
      brief: data.brief || '',
      clientEmail: isProject ? (data as DatabaseProject).client_email || '' : '',
      paymentProofRequired: data.payment_proof_required || false,
      contractRequired: data.contract_required || false,
      contractTerms: data.contract_terms || '',
      paymentTerms: data.payment_terms || '',
      projectScope: data.project_scope || '',
      revisionPolicy: data.revision_policy || '',
      milestones: (data.milestones as DatabaseMilestone[])?.map((milestone: DatabaseMilestone) => ({
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

  // Initialize form with appropriate data
  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: formatDataForForm(mode === 'edit' ? existingProject : templateData),
  });

  // Update form when data changes
  useEffect(() => {
    const dataToLoad = mode === 'edit' ? existingProject : templateData;
    if (dataToLoad) {
      const formattedData = formatDataForForm(dataToLoad);
      form.reset(formattedData);
    }
  }, [templateData, existingProject, form, mode]);

  // Milestone management
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
    const formattedData = formatDataForForm(template);
    form.reset(formattedData);
  };

  return {
    form,
    addMilestone,
    removeMilestone,
    loadFromTemplate,
  };
};