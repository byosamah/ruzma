
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MilestoneFormData {
  title: string;
  description: string;
  price: number;
}

export interface ProjectFormData {
  name: string;
  brief: string;
  milestones: MilestoneFormData[];
  saveAsTemplate: boolean;
  templateName: string;
}

export const useCreateProjectForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    brief: '',
    milestones: [{ title: '', description: '', price: 0 }],
    saveAsTemplate: false,
    templateName: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMilestone = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', description: '', price: 0 }]
    }));
  }, []);

  const removeMilestone = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  }, []);

  const updateMilestone = useCallback((index: number, field: keyof MilestoneFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }));
  }, []);

  const loadFromTemplate = useCallback((template: any) => {
    console.log('Loading template:', template);
    
    // Map template milestones to ensure all required properties are present
    const templateMilestones: MilestoneFormData[] = template.milestones.map((milestone: any) => ({
      title: milestone.title || '',
      description: milestone.description || '',
      price: milestone.price || 0,
    }));

    setFormData(prev => ({
      ...prev,
      name: template.name || '',
      brief: template.brief || '',
      milestones: templateMilestones.length > 0 ? templateMilestones : [{ title: '', description: '', price: 0 }],
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return false;
    }

    if (!formData.brief.trim()) {
      toast.error('Project brief is required');
      return false;
    }

    if (formData.milestones.length === 0) {
      toast.error('At least one milestone is required');
      return false;
    }

    for (let i = 0; i < formData.milestones.length; i++) {
      const milestone = formData.milestones[i];
      if (!milestone.title.trim()) {
        toast.error(`Milestone ${i + 1} title is required`);
        return false;
      }
      if (!milestone.description.trim()) {
        toast.error(`Milestone ${i + 1} description is required`);
        return false;
      }
      if (milestone.price <= 0) {
        toast.error(`Milestone ${i + 1} price must be greater than 0`);
        return false;
      }
    }

    if (formData.saveAsTemplate && !formData.templateName.trim()) {
      toast.error('Template name is required when saving as template');
      return false;
    }

    return true;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

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
          name: formData.name,
          brief: formData.brief,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create milestones
      const milestoneInserts = formData.milestones.map((milestone, index) => ({
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

      // Save as template if requested
      if (formData.saveAsTemplate) {
        const { error: templateError } = await supabase
          .from('project_templates')
          .insert({
            name: formData.templateName,
            brief: formData.brief,
            milestones: formData.milestones,
            user_id: user.id,
          });

        if (templateError) {
          console.error('Template save error:', templateError);
          toast.error('Project created but failed to save template');
        } else {
          toast.success('Project created and template saved!');
        }
      } else {
        toast.success('Project created successfully!');
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, navigate]);

  return {
    formData,
    setFormData,
    isSubmitting,
    addMilestone,
    removeMilestone,
    updateMilestone,
    loadFromTemplate,
    handleSubmit,
  };
};
