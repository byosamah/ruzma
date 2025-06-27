
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logSecurityEvent } from '@/lib/authSecurity';

export const useProjectCRUD = (user: User | null) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createProject = useCallback(async (projectData: any) => {
    if (!user) return false;
    
    setIsCreating(true);
    try {
      logSecurityEvent('project_creation_initiated', { userId: user.id });
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      logSecurityEvent('project_created', { userId: user.id, projectId: data.id });
      toast.success('Project created successfully!');
      return data;
    } catch (error: any) {
      console.error('Error creating project:', error);
      logSecurityEvent('project_creation_failed', { userId: user.id, error: error.message });
      toast.error('Failed to create project');
      return false;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateProject = async (projectId: string, data: {
    name: string;
    brief: string;
    clientEmail: string;
    paymentProofRequired?: boolean;
    milestones: Array<{
      title: string;
      description: string;
      price: number;
      status: string;
      start_date?: string;
      end_date?: string;
    }>;
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      // Ensure paymentProofRequired is properly handled
      const projectUpdateData = {
        name: data.name,
        brief: data.brief,
        client_email: data.clientEmail || null,
        payment_proof_required: data.paymentProofRequired ?? false, // Use nullish coalescing to handle undefined
        updated_at: new Date().toISOString(),
      };

      console.log('Updating project with data:', projectUpdateData); // Debug log

      const { error: projectError } = await supabase
        .from('projects')
        .update(projectUpdateData)
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (projectError) {
        console.error('Error updating project:', projectError);
        return false;
      }

      // Update milestones
      const { error: deleteError } = await supabase
        .from('milestones')
        .delete()
        .eq('project_id', projectId);

      if (deleteError) {
        console.error('Error deleting old milestones:', deleteError);
        return false;
      }

      const milestonesToInsert = data.milestones.map((milestone) => ({
        project_id: projectId,
        title: milestone.title,
        description: milestone.description,
        price: milestone.price,
        status: milestone.status,
        start_date: milestone.start_date || null,
        end_date: milestone.end_date || null,
      }));

      const { error: milestonesError } = await supabase
        .from('milestones')
        .insert(milestonesToInsert);

      if (milestonesError) {
        console.error('Error creating new milestones:', milestonesError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateProject:', error);
      return false;
    }
  };

  const deleteProject = useCallback(async (projectId: string) => {
    if (!user) return false;
    
    setIsDeleting(true);
    try {
      logSecurityEvent('project_deletion_initiated', { userId: user.id, projectId });
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      logSecurityEvent('project_deleted', { userId: user.id, projectId });
      toast.success('Project deleted successfully!');
      return true;
    } catch (error: any) {
      console.error('Error deleting project:', error);
      logSecurityEvent('project_deletion_failed', { userId: user.id, projectId, error: error.message });
      toast.error('Failed to delete project');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    createProject,
    updateProject,
    deleteProject,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
