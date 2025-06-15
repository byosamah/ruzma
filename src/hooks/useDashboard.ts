
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useProjects } from '@/hooks/useProjects';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useT } from '@/lib/i18n';

export const useDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const t = useT();

  const { projects, loading: projectsLoading, deleteProject } = useProjects(user);
  const userCurrency = useUserCurrency(user);

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts
    
    const fetchUserAndProfile = async () => {
      if (!isMounted) return;
      
      console.log('Dashboard: Starting auth check...');
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('Dashboard: Auth result -', { 
          hasUser: !!user, 
          userEmail: user?.email, 
          error: userError?.message 
        });
        
        if (!isMounted) return;
        
        if (userError || !user) {
          console.log('Dashboard: No authenticated user, redirecting to login');
          setLoading(false);
          navigate('/login');
          return;
        }

        setUser(user);
        console.log('Dashboard: User authenticated, fetching profile...');

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (!isMounted) return;

        console.log('Dashboard: Profile fetch result -', { 
          hasProfile: !!profileData, 
          profileError: profileError?.message 
        });

        if (profileError) {
          console.log('Dashboard: Creating new profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || t('defaultUser')
            })
            .select()
            .single();
            
          if (!isMounted) return;
          
          if (createError) {
            console.error("Dashboard: Profile creation failed:", createError);
            toast.error(t("profileSetupError"));
          } else {
            console.log('Dashboard: New profile created');
            setProfile(newProfile);
          }
        } else {
          setProfile(profileData);
          console.log('Dashboard: Existing profile loaded');
        }
      } catch (error) {
        console.error('Dashboard: Unexpected error:', error);
        if (isMounted) {
          setLoading(false);
          navigate('/login');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('Dashboard: Loading complete');
        }
      }
    };

    fetchUserAndProfile();
    
    return () => {
      isMounted = false;
    };
  }, [navigate, t]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleEditProject = (project: any) => {
    navigate(`/edit-project/${project.id}`);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm(t('areYouSureDeleteProject'))) {
      await deleteProject(projectId);
    }
  };

  const convertedProjects = useMemo(() => projects.map(project => ({
    id: project.id,
    name: project.name,
    brief: project.brief,
    milestones: project.milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      price: milestone.price,
      status: milestone.status,
    })),
    createdAt: new Date(project.created_at).toLocaleDateString(),
    clientUrl: `/client/project/${project.id}`,
  })), [projects]);

  const stats = useMemo(() => {
    const totalProjects = convertedProjects.length;
    const totalMilestones = convertedProjects.reduce((sum, project) => sum + project.milestones.length, 0);
    const completedMilestones = convertedProjects.reduce((sum, project) => 
      sum + project.milestones.filter(m => m.status === 'approved').length, 0);
    const pendingPayments = convertedProjects.reduce((sum, project) => 
      sum + project.milestones.filter(m => m.status === 'payment_submitted').length, 0);
    const totalEarnings = convertedProjects.reduce((sum, project) => 
      sum + project.milestones.filter(m => m.status === 'approved').reduce((mSum, m) => mSum + m.price, 0), 0);
    return { totalProjects, totalMilestones, completedMilestones, pendingPayments, totalEarnings };
  }, [convertedProjects]);

  const displayName = useMemo(() =>
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    t("defaultUser"), [profile, user, t]);

  return {
    user,
    profile,
    loading: loading || projectsLoading,
    projects: convertedProjects,
    userCurrency,
    stats,
    displayName,
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  };
};
