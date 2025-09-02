import { useQuery } from '@tanstack/react-query';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject } from '@/hooks/projectTypes';
import { setUserProperties } from '@/lib/analytics';

const fetchDashboardData = async (user: User) => {
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

  const { data: profileData, error: profileError } = profileResult;
  const { data: projectsData, error: projectsError } = projectsResult;

  if (profileError) throw profileError;
  if (projectsError) throw projectsError;

  // Type the projects data properly
  const typedProjects: DatabaseProject[] = (projectsData || []).map(project => ({
    ...project,
    contract_status: project.contract_status as 'pending' | 'approved' | 'rejected' | undefined,
    milestones: project.milestones.map((milestone) => ({
      ...milestone,
      status: milestone.status as 'pending' | 'payment_submitted' | 'approved' | 'rejected'
    }))
  }));

  // Set user properties for analytics
  if (profileData && projectsData) {
    setUserProperties(
      user.id,
      profileData.user_type || 'free',
      profileData.currency || 'USD',
      projectsData.length
    );
  }

  return {
    profile: profileData,
    projects: typedProjects
  };
};

export const useDashboardDataQuery = (user: User | null) => {
  return useQuery({
    queryKey: ['dashboard-data', user?.id],
    queryFn: () => fetchDashboardData(user!),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard data
    retry: 1,
  });
};