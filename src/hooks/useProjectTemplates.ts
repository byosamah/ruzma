
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface ProjectTemplate {
  id: string;
  user_id: string;
  name: string;
  brief: string;
  contract_required?: boolean;
  payment_proof_required?: boolean;
  contract_terms?: string;
  payment_terms?: string;
  project_scope?: string;
  revision_policy?: string;
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
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Parse milestones jsonb field
      setTemplates(
        (data || []).map((t: any) => ({
          ...t,
          milestones: Array.isArray(t.milestones) ? t.milestones : [],
        }))
      );
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
  }) => {
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

  const deleteTemplate = async (templateId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete a template');
      return false;
    }

    try {
      const { error } = await supabase
        .from('project_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user.id);
      if (error) throw error;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    templates,
    loading,
    fetchTemplates,
    saveTemplate,
    deleteTemplate,
  };
};
