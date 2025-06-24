
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logSecurityEvent } from '@/lib/authSecurity';

export const useProjectCRUD = (user: User | null, onRefresh: () => void) => {
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
      onRefresh();
      return data;
    } catch (error: any) {
      console.error('Error creating project:', error);
      logSecurityEvent('project_creation_failed', { userId: user.id, error: error.message });
      toast.error('Failed to create project');
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [user, onRefresh]);

  const updateProject = useCallback(async (projectId: string, updates: any) => {
    if (!user) return false;
    
    setIsUpdating(true);
    try {
      logSecurityEvent('project_update_initiated', { userId: user.id, projectId });
      
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      logSecurityEvent('project_updated', { userId: user.id, projectId });
      toast.success('Project updated successfully!');
      onRefresh();
      return true;
    } catch (error: any) {
      console.error('Error updating project:', error);
      logSecurityEvent('project_update_failed', { userId: user.id, projectId, error: error.message });
      toast.error('Failed to update project');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [user, onRefresh]);

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
      onRefresh();
      return true;
    } catch (error: any) {
      console.error('Error deleting project:', error);
      logSecurityEvent('project_deletion_failed', { userId: user.id, projectId, error: error.message });
      toast.error('Failed to delete project');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [user, onRefresh]);

  return {
    createProject,
    updateProject,
    deleteProject,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
