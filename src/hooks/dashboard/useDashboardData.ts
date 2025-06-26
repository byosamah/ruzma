
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject } from '@/hooks/projectTypes';
import { setUserProperties } from '@/lib/analytics';

export const useDashboardData = (user: User | null) => {
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
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

        setProjects(projectsData || []);

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

    fetchData();
  }, [user]);

  return {
    projects,
    profile,
    loading,
    refetch: () => {
      if (user) {
        // Refetch logic here
      }
    }
  };
};
