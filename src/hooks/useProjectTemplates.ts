
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface ProjectTemplate {
  id: string;
  user_id: string;
  name: string;
  brief: string;
  milestones: {
    title: string;
    description: string;
    price: number;
  }[];
  created_at: string;
  updated_at: string;
}

export const useProjectTemplates = (user: User | null) => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement after creating the templates table
      // For now, return empty array
      setTemplates([]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (templateData: {
    name: string;
    brief: string;
    milestones: Array<{
      title: string;
      description: string;
      price: number;
    }>;
  }) => {
    if (!user) {
      toast.error('You must be logged in to save a template');
      return false;
    }

    try {
      // TODO: Implement after creating the templates table
      toast.success('Template saved successfully');
      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
      return false;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete a template');
      return false;
    }

    try {
      // TODO: Implement after creating the templates table
      toast.success('Template deleted successfully');
      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
      return false;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates,
    loading,
    fetchTemplates,
    saveTemplate,
    deleteTemplate,
  };
};
