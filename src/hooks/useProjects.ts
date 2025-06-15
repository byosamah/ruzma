
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { DatabaseProject } from './projectTypes';
import { useProjectActions } from './useProjectActions';
import { useMilestoneActions } from './useMilestoneActions';

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

      const typedProjects = (projectsData || []).map(project => ({
        ...project,
        milestones: project.milestones.map((milestone: any) => ({
          ...milestone,
          status: milestone.status as 'pending' | 'payment_submitted' | 'approved' | 'rejected',
          watermark_text: milestone.watermark_text ?? null,
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

  // Import project and milestone actions
  const { createProject, updateProject, deleteProject } = useProjectActions(user, fetchProjects);
  const milestoneActions = useMilestoneActions(user, projects, fetchProjects);

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
    ...milestoneActions
  };
};
