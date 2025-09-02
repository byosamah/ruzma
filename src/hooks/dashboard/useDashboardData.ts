
import { useEffect, useState, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject } from '@/hooks/projectTypes';
import { setUserProperties } from '@/lib/analytics';

interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  user_type?: string;
  currency?: string;
  subscription_status?: string;
  subscription_id?: string;
}

export const useDashboardData = (user: User | null) => {
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      // Fetch both profile and projects in parallel
      const [profileResult, projectsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, email, currency, user_type, project_count, storage_used, created_at, updated_at')
          .eq('id', user.id)
          .single(),
        supabase
          .from('projects')
          .select(`
            *,
            milestones (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      const { data: profileData } = profileResult;
      const { data: projectsData } = projectsResult;

      setProfile(profileData);

      // Type the projects data properly
      const typedProjects: DatabaseProject[] = (projectsData || []).map(project => ({
        ...project,
        contract_status: project.contract_status as 'pending' | 'approved' | 'rejected' | undefined,
        milestones: project.milestones.map((milestone) => ({
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
      // Error fetching dashboard data handled by UI
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const memoizedReturn = useMemo(() => ({
    projects,
    profile,
    loading,
    refetch: fetchData
  }), [projects, profile, loading, fetchData]);

  return memoizedReturn;
};
