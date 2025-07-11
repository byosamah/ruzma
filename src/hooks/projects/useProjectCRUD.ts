
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject } from '@/types/shared';
import { generateSlug, ensureUniqueSlug } from '@/lib/slugUtils';
import { logSecurityEvent } from '@/lib/authSecurity';

export const useProjectCRUD = (user: User | null) => {
  const [updating, setUpdating] = useState(false);

  const createProject = async (projectData: any): Promise<DatabaseProject | null> => {
    if (!user) return null;

    setUpdating(true);
    try {
      logSecurityEvent('project_creation_initiated');
      
      // Generate slug from project name
      const baseSlug = generateSlug(projectData.name);
      const uniqueSlug = await ensureUniqueSlug(baseSlug, user.id);

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
          slug: uniqueSlug,
        })
        .select(`
          *,
          milestones (*)
        `)
        .single();

      if (error) {
        console.error('Error creating project:', error);
        return null;
      }

      // Create milestones if provided
      if (projectData.milestones && projectData.milestones.length > 0) {
        const milestonesWithProjectId = projectData.milestones.map((milestone: any) => ({
          ...milestone,
          project_id: data.id,
        }));

        const { error: milestonesError } = await supabase
          .from('milestones')
          .insert(milestonesWithProjectId);

        if (milestonesError) {
          console.error('Error creating milestones:', milestonesError);
        }
      }

      logSecurityEvent('project_created', { projectId: data.id });
      return data as DatabaseProject;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const updateProject = async (projectId: string, updates: any): Promise<boolean> => {
    if (!user) return false;

    setUpdating(true);
    try {
      logSecurityEvent('project_update_initiated', { projectId });

      // Update project
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          name: updates.name,
          brief: updates.brief,
          client_email: updates.clientEmail,
          payment_proof_required: updates.paymentProofRequired,
        })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (projectError) {
        console.error('Error updating project:', projectError);
        return false;
      }

      // Handle milestones update
      if (updates.milestones) {
        // Delete existing milestones
        await supabase
          .from('milestones')
          .delete()
          .eq('project_id', projectId);

        // Insert new milestones
        const milestonesWithProjectId = updates.milestones.map((milestone: any) => ({
          ...milestone,
          project_id: projectId,
        }));

        const { error: milestonesError } = await supabase
          .from('milestones')
          .insert(milestonesWithProjectId);

        if (milestonesError) {
          console.error('Error updating milestones:', milestonesError);
          return false;
        }
      }

      logSecurityEvent('project_updated', { projectId });
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    if (!user) {
      console.error('No user found for delete operation');
      return false;
    }

    if (!projectId) {
      console.error('No project ID provided for delete operation');
      return false;
    }

    console.log('Starting delete operation for project:', projectId); // Debug log

    try {
      logSecurityEvent('project_deletion_started', { projectId });

      // First delete milestones
      const { error: milestonesError } = await supabase
        .from('milestones')
        .delete()
        .eq('project_id', projectId);

      if (milestonesError) {
        console.error('Error deleting milestones:', milestonesError);
        return false;
      }

      // Then delete the project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (projectError) {
        console.error('Error deleting project:', projectError);
        return false;
      }

      logSecurityEvent('project_deleted', { projectId });
      console.log('Project deleted successfully:', projectId); // Debug log
      return true;
    } catch (error) {
      console.error('Error in deleteProject:', error);
      return false;
    }
  };

  return {
    createProject,
    updateProject,
    deleteProject,
    updating,
  };
};
