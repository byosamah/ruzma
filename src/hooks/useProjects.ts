
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export interface DatabaseProject {
  id: string;
  user_id: string;
  name: string;
  brief: string;
  created_at: string;
  updated_at: string;
  milestones: DatabaseMilestone[];
}

export interface DatabaseMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  deliverable_name?: string;
  deliverable_url?: string;
  deliverable_size?: number;
  payment_proof_url?: string;
}

export const useProjects = (user: User | null) => {
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch projects with their milestones
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          milestones (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        toast.error('Failed to load projects');
        return;
      }

      // Type assertion to ensure proper typing
      const typedProjects = (projectsData || []).map(project => ({
        ...project,
        milestones: project.milestones.map((milestone: any) => ({
          ...milestone,
          status: milestone.status as 'pending' | 'payment_submitted' | 'approved' | 'rejected'
        }))
      })) as DatabaseProject[];

      setProjects(typedProjects);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: {
    name: string;
    brief: string;
    milestones: Array<{
      title: string;
      description: string;
      price: number;
    }>;
  }) => {
    if (!user) {
      toast.error('You must be logged in to create a project');
      return null;
    }

    try {
      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectData.name,
          brief: projectData.brief,
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        toast.error('Failed to create project');
        return null;
      }

      // Create the milestones
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

      toast.success('Project created successfully');
      await fetchProjects(); // Refresh the list
      return project;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create project');
      return null;
    }
  };

  const updateProject = async (projectId: string, projectData: {
    name: string;
    brief: string;
    milestones: Array<{
      id?: string;
      title: string;
      description: string;
      price: number;
      status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
    }>;
  }) => {
    if (!user) {
      toast.error('You must be logged in to update a project');
      return false;
    }

    try {
      // Update the project
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

      // Handle milestones - delete existing ones and create new ones
      const { error: deleteError } = await supabase
        .from('milestones')
        .delete()
        .eq('project_id', projectId);

      if (deleteError) {
        console.error('Error deleting old milestones:', deleteError);
        toast.error('Failed to update milestones');
        return false;
      }

      // Create new milestones
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
      await fetchProjects(); // Refresh the list
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

      toast.success('Project deleted successfully');
      await fetchProjects(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete project');
      return false;
    }
  };

  const updateMilestoneStatus = async (milestoneId: string, status: 'pending' | 'payment_submitted' | 'approved' | 'rejected') => {
    if (!user) {
      toast.error('You must be logged in to update milestone status');
      return false;
    }

    try {
      const { error } = await supabase
        .from('milestones')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (error) {
        console.error('Error updating milestone status:', error);
        toast.error('Failed to update milestone status');
        return false;
      }

      await fetchProjects(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update milestone status');
      return false;
    }
  };

  const uploadDeliverable = async (milestoneId: string, file: File) => {
    if (!user) {
      toast.error('You must be logged in to upload deliverables');
      return false;
    }

    try {
      console.log('Uploading deliverable for milestone:', milestoneId, 'File:', file.name, 'Size:', file.size);
      
      // For now, we'll store the file info in the database
      // In a real app, you'd upload to Supabase Storage first
      const { error } = await supabase
        .from('milestones')
        .update({
          deliverable_name: file.name,
          deliverable_size: file.size,
          deliverable_url: `temp-url-${milestoneId}`, // This would be the actual storage URL
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (error) {
        console.error('Error uploading deliverable:', error);
        toast.error('Failed to upload deliverable');
        return false;
      }

      toast.success('Deliverable uploaded successfully');
      await fetchProjects(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to upload deliverable');
      return false;
    }
  };

  const downloadDeliverable = async (milestoneId: string) => {
    try {
      // Find the milestone
      const milestone = projects
        .flatMap(p => p.milestones)
        .find(m => m.id === milestoneId);

      if (!milestone || !milestone.deliverable_name) {
        toast.error('Deliverable not found');
        return false;
      }

      if (milestone.status !== 'approved') {
        toast.error('Payment must be approved before downloading');
        return false;
      }

      // In a real app, this would download from Supabase Storage
      console.log('Downloading deliverable:', milestone.deliverable_name);
      toast.success(`Downloading ${milestone.deliverable_name}`);
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to download deliverable');
      return false;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    updateMilestoneStatus,
    uploadDeliverable,
    downloadDeliverable,
  };
};
