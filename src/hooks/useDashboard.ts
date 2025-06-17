
import { useState, useEffect, useMemo, useCallback } from 'react';
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
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const t = useT();

  const { projects, loading: projectsLoading, deleteProject } = useProjects(user);
  const userCurrency = useUserCurrency(user);

  useEffect(() => {
    if (authChecked) return; // Prevent multiple auth checks
    
    let isMounted = true;
    
    const fetchUserAndProfile = async () => {
      if (!isMounted) return;
      
      console.log('Dashboard: Starting auth check...');
      
      try {
        // Handle auth tokens from URL hash (email confirmation)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
          console.log('Dashboard: Processing auth tokens from URL hash');
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('Dashboard: Error setting session from URL:', error);
              toast.error('Authentication failed. Please try logging in again.');
            } else {
              console.log('Dashboard: Session set successfully from URL tokens');
              toast.success('Email confirmed successfully! Welcome to Ruzma.');
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname);
            }
          }
        }

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
          setAuthChecked(true);
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
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
            })
            .select()
            .single();
            
          if (!isMounted) return;
          
          if (createError) {
            console.error("Dashboard: Profile creation failed:", createError);
            toast.error("Profile setup error");
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
          setAuthChecked(true);
          navigate('/login');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setAuthChecked(true);
          console.log('Dashboard: Loading complete');
        }
      }
    };

    fetchUserAndProfile();
    
    return () => {
      isMounted = false;
    };
  }, [authChecked, navigate]); // Added navigate to dependencies

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigate('/');
  }, [navigate]);

  const handleEditProject = useCallback((project: any) => {
    navigate(`/edit-project/${project.id}`);
  }, [navigate]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId);
    }
  }, [deleteProject]);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalMilestones = projects.reduce((sum, project) => sum + project.milestones.length, 0);
    const completedMilestones = projects.reduce((sum, project) => 
      sum + project.milestones.filter(m => m.status === 'approved').length, 0);
    const pendingPayments = projects.reduce((sum, project) => 
      sum + project.milestones.filter(m => m.status === 'payment_submitted').length, 0);
    const totalEarnings = projects.reduce((sum, project) => 
      sum + project.milestones.filter(m => m.status === 'approved').reduce((mSum, m) => mSum + m.price, 0), 0);
    return { totalProjects, totalMilestones, completedMilestones, pendingPayments, totalEarnings };
  }, [projects]);

  const displayName = useMemo(() =>
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User", [profile, user]);

  return {
    user,
    profile,
    loading: loading || projectsLoading,
    projects,
    userCurrency,
    stats,
    displayName,
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  };
};
