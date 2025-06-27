
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject } from '@/hooks/projectTypes';
import { setUserProperties } from '@/lib/analytics';

export const useDashboardData = (user: User | null) => {
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select(`
          *,
          milestones (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Type the projects data properly
      const typedProjects: DatabaseProject[] = (projectsData || []).map(project => ({
        ...project,
        milestones: project.milestones.map((milestone: any) => ({
          ...milestone,
          status: milestone.status as 'pending' | 'payment_submitted' | 'approved' | 'rejected'
        }))
      }));

      setProjects(typedProjects);

      // Set user properties for analytics
      if (profileData && projectsData) {
        setUserProperties(
          user.id,
          profileData.user_type || 'free',
          profileData.currency || 'USD',
          projectsData.length
        );
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    projects,
    profile,
    loading,
    refetch: fetchData
  };
};
