import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { DatabaseProject } from './projectTypes';
import { type CreateProjectFormData } from '@/lib/validators/project';
import { calculateProjectDates } from '@/lib/projectDateUtils';

export function useProjectActions(user: User | null, fetchProjects: () => Promise<void>) {
  const createProject = async (projectData: CreateProjectFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a project');
      return null;
    }
    try {
      // Check project limits before creating
      const { data: limitCheck, error: limitError } = await supabase
        .rpc('check_user_limits', {
          _user_id: user.id,
          _action: 'project'
        });

      if (limitError) {
        console.error('Error checking limits:', limitError);
        toast.error('Failed to check project limits');
        return null;
      }

      if (!limitCheck) {
        toast.error('Project limit reached. Please upgrade your plan to create more projects.');
        return null;
      }

      // Calculate project dates from milestones
      const { start_date, end_date } = calculateProjectDates(projectData.milestones);

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectData.name,
          brief: projectData.brief,
          client_email: projectData.clientEmail,
          start_date,
          end_date,
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
          start_date: milestone.start_date || null,
          end_date: milestone.end_date || null,
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
      const { error: updateError } = await supabase
        .rpc('update_project_count', {
          _user_id: user.id,
          _count_change: 1
        });

      if (updateError) {
        console.error('Error updating project count:', updateError);
      }

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
      clientEmail?: string;
      milestones: Array<{
        id?: string;
        title: string;
        description: string;
        price: number;
        status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
        start_date?: string;
        end_date?: string;
      }>;
    }
  ) => {
    if (!user) {
      toast.error('You must be logged in to update a project');
      return false;
    }
    try {
      // Calculate project dates from milestones
      const { start_date, end_date } = calculateProjectDates(projectData.milestones);

      const { error: projectError } = await supabase
        .from('projects')
        .update({
          name: projectData.name,
          brief: projectData.brief,
          client_email: projectData.clientEmail,
          start_date,
          end_date,
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
          start_date: milestone.start_date || null,
          end_date: milestone.end_date || null,
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
      const { error: updateError } = await supabase
        .rpc('update_project_count', {
          _user_id: user.id,
          _count_change: -1
        });

      if (updateError) {
        console.error('Error updating project count:', updateError);
      }

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
