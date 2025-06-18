
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { DatabaseProject } from './projectTypes';
import { type CreateProjectFormData } from '@/lib/validators/project';
import { useSubscription } from './useSubscription';

export function useProjectActions(user: User | null, fetchProjects: () => Promise<void>) {
  const { checkUserLimits, updateProjectCount } = useSubscription(user);

  const createProject = async (projectData: CreateProjectFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a project');
      return null;
    }

    // Check project creation limit
    const canCreate = await checkUserLimits('project');
    if (!canCreate) {
      toast.error('Project limit reached. Upgrade to Plus Tier for unlimited projects.');
      return null;
    }

    try {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectData.name,
          brief: projectData.brief,
          client_email: projectData.clientEmail,
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        toast.error('Failed to create project');
        return null;
      }

      if (projectData.milestones.length > 0) {
        const milestonesToInsert = projectData.milestones.map(milestone => ({
          project_id: project.id,
          title: milestone.title,
          description: milestone.description,
          price: milestone.price,
        }));

        const { error: milestonesError } = await supabase
          .from('milestones')
          .insert(milestonesToInsert);

        if (milestonesError) {
          console.error('Error creating milestones:', milestonesError);
          toast.error('Project created but failed to create milestones');
        }
      }

      // Update project count
      await updateProjectCount(1);

      toast.success('Project created successfully');
      await fetchProjects();
      return project;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create project');
      return null;
    }
  };

  const updateProject = async (
    projectId: string,
    projectData: {
      name: string;
      brief: string;
      milestones: Array<{
        id?: string;
        title: string;
        description: string;
        price: number;
        status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
      }>;
    }
  ) => {
    if (!user) {
      toast.error('You must be logged in to update a project');
      return false;
    }
    try {
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          name: projectData.name,
          brief: projectData.brief,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (projectError) {
        console.error('Error updating project:', projectError);
        toast.error('Failed to update project');
        return false;
      }

      const { error: deleteError } = await supabase
        .from('milestones')
        .delete()
        .eq('project_id', projectId);

      if (deleteError) {
        console.error('Error deleting old milestones:', deleteError);
        toast.error('Failed to update milestones');
        return false;
      }

      if (projectData.milestones.length > 0) {
        const milestonesToInsert = projectData.milestones.map(milestone => ({
          project_id: projectId,
          title: milestone.title,
          description: milestone.description,
          price: milestone.price,
          status: milestone.status,
        }));

        const { error: milestonesError } = await supabase
          .from('milestones')
          .insert(milestonesToInsert);

        if (milestonesError) {
          console.error('Error creating new milestones:', milestonesError);
          toast.error('Project updated but failed to update milestones');
          return false;
        }
      }

      toast.success('Project updated successfully');
      await fetchProjects();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update project');
      return false;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete a project');
      return false;
    }
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
        return false;
      }

      // Update project count
      await updateProjectCount(-1);

      toast.success('Project deleted successfully');
      await fetchProjects();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete project');
      return false;
    }
  };

  return { createProject, updateProject, deleteProject };
}
