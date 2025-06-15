
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useProjects, DatabaseProject } from '@/hooks/useProjects';
import { useUserCurrency } from '@/hooks/useUserCurrency';

export function useProjectManagement(projectId: string | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { projects, updateMilestoneStatus, uploadPaymentProof, uploadDeliverable, downloadDeliverable, updateMilestoneWatermark } = useProjects(user);
  const userCurrency = useUserCurrency(user);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }

      setUser(user);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      setProfile(profileData);
      setLoading(false);
    };

    checkAuthAndLoadData();
  }, [navigate]);

  useEffect(() => {
    if (projects.length > 0 && projectId) {
      const found = projects.find((p) => p.id === projectId);
      setProject(found || null);
    }
  }, [projects, projectId]);

  return {
    user,
    profile,
    project,
    loading,
    userCurrency,
    updateMilestoneStatus,
    uploadPaymentProof,
    uploadDeliverable,
    downloadDeliverable,
    updateMilestoneWatermark
  };
}
