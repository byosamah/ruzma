import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@supabase/supabase-js';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { createProjectFormSchema, CreateProjectFormData } from '@/lib/validators/project';
import { ProjectService, ProjectOperationData } from '@/services/projectService';
import { ProjectTemplate } from '@/types/projectTemplate';
import { DatabaseProject } from '@/hooks/projectTypes';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject } from '@/hooks/projectTypes';
import { DatabaseProject } from '@/hooks/projectTypes';

export interface UseProjectManagerOptions {
  mode: 'create' | 'edit';
  user: User | null;
  projectId?: string;
  templateData?: ProjectTemplate;
  existingProject?: DatabaseProject;
}

export const useProjectManager = (options: UseProjectManagerOptions) => {
  const { mode, user, projectId, templateData, existingProject } = options;
  const { navigate } = useLanguageNavigation();
  const t = useT();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Initialize the project service
  const projectService = new ProjectService(user);

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
      milestones: (data.milestones as any[])?.map((milestone: any) => ({
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

  // ==================== MILESTONE MANAGEMENT ====================
  
  const updateMilestoneStatus = async (
    projects: DatabaseProject[],
    milestoneId: string,
    status: 'approved' | 'rejected'
  ): Promise<boolean> => {
    return await projectService.updateMilestoneStatus(projects, milestoneId, status);
  };

  const updateMilestoneStatusGeneral = async (
    milestoneId: string,
    status: 'pending' | 'payment_submitted' | 'approved' | 'rejected'
  ): Promise<boolean> => {
    return await projectService.updateMilestoneStatusGeneral(milestoneId, status);
  };

  const uploadPaymentProof = async (milestoneId: string, file: File): Promise<boolean> => {
    return await projectService.uploadPaymentProof(milestoneId, file);
  };

  const uploadDeliverable = async (milestoneId: string, file: File): Promise<boolean> => {
    return await projectService.uploadDeliverable(milestoneId, file);
  };

  const downloadDeliverable = async (
    projects: DatabaseProject[],
    milestoneId: string,
    paymentProofRequired: boolean = true
  ): Promise<boolean> => {
    return await projectService.downloadDeliverable(projects, milestoneId, paymentProofRequired);
  };

  const updateDeliverableLink = async (milestoneId: string, link: string): Promise<boolean> => {
    return await projectService.updateDeliverableLink(milestoneId, link);
  };

  const updateRevisionData = async (milestoneId: string, newDeliverableLink: string): Promise<boolean> => {
    return await projectService.updateRevisionData(milestoneId, newDeliverableLink);
  };

  const addRevisionRequest = async (milestoneId: string, newDeliverableLink: string): Promise<boolean> => {
    return await projectService.addRevisionRequest(milestoneId, newDeliverableLink);
  };

  // Client-specific revision request handler
  const addRevisionRequestClient = async (
    milestoneId: string,
    feedback: string,
    images: string[]
  ): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('submit-revision-request', {
        body: {
          milestoneId,
          feedback,
          images
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error submitting revision request:', error);
      throw error;
    }
  };

  // ==================== TEMPLATE MANAGEMENT ====================
  
  const saveTemplate = async (templateData: {
    name: string;
    brief: string;
    contract_required?: boolean;
    payment_proof_required?: boolean;
    contract_terms?: string;
    payment_terms?: string;
    project_scope?: string;
    revision_policy?: string;
    milestones: Array<{
      title: string;
      description: string;
      price: number;
    }>;
  }): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to save a template');
      return false;
    }

    try {
      const { error } = await supabase
        .from('project_templates')
        .insert({
          user_id: user.id,
          name: templateData.name,
          brief: templateData.brief,
          contract_required: templateData.contract_required || false,
          payment_proof_required: templateData.payment_proof_required || false,
          contract_terms: templateData.contract_terms,
          payment_terms: templateData.payment_terms,
          project_scope: templateData.project_scope,
          revision_policy: templateData.revision_policy,
          milestones: templateData.milestones,
        });
      if (error) throw error;
      toast.success('Template saved successfully');
      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
      return false;
    }
  };

  // Main submit handler
  const handleSubmit = async (data: CreateProjectFormData) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare project data
      const projectData: ProjectOperationData = {
        ...data,
        ...(mode === 'edit' && existingProject && {
          id: existingProject.id,
          slug: existingProject.slug,
        }),
      };

      // Save project
      const result = await projectService.saveProject(projectData, mode);
      
      if (!result) {
        throw new Error(`Failed to ${mode} project`);
      }

      // Save as template if requested (only for create mode)
      if (mode === 'create' && saveAsTemplate) {
        await projectService.saveAsTemplate({
          id: '', // Will be generated by Supabase
          name: `${data.name} Template`,
          brief: data.brief,
          contract_required: data.contractRequired,
          payment_proof_required: data.paymentProofRequired,
          contract_terms: data.contractTerms,
          payment_terms: data.paymentTerms,
          project_scope: data.projectScope,
          revision_policy: data.revisionPolicy,
          milestones: data.milestones.map(m => ({
            title: m.title,
            description: m.description,
            price: m.price,
            start_date: m.start_date || '',
            end_date: m.end_date || '',
          })),
        });
        toast.success('Template saved successfully');
      }

      // Show success message
      toast.success(
        mode === 'create' 
          ? 'Project created successfully' 
          : 'Project updated successfully'
      );

      // Navigate to appropriate page
      if (mode === 'create') {
        navigate(`/project/${result.slug}`);
      } else {
        navigate('/projects');
      }

    } catch (error: any) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} project:`, error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Template operations
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const fetchedTemplates = await projectService.getTemplates();
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('An error occurred');
    } finally {
      setTemplatesLoading(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await projectService.deleteTemplate(templateId);
      await fetchTemplates(); // Refresh templates
      toast.success('Template deleted successfully');
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(error.message || 'An error occurred');
    }
  };

  // Load templates on mount if user exists
  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  return {
    // Form management
    form,
    isSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit),
    
    // Milestone management
    addMilestone,
    removeMilestone,
    loadFromTemplate,
    
    // Template operations
    templates,
    templatesLoading,
    fetchTemplates,
    deleteTemplate,
    saveTemplate,
    saveAsTemplate,
    setSaveAsTemplate,
    
    // Milestone operations
    updateMilestoneStatus,
    updateMilestoneStatusGeneral,
    uploadPaymentProof,
    uploadDeliverable,
    downloadDeliverable,
    updateDeliverableLink,
    updateRevisionData,
    addRevisionRequest,
    addRevisionRequestClient,
    
    // Mode
    mode,
  };
};