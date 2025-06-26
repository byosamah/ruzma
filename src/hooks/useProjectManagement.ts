
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useProjects, DatabaseProject } from '@/hooks/useProjects';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { isUUID } from '@/lib/slugUtils';

export function useProjectManagement(slugOrId: string | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { projects, updateMilestoneStatus, uploadPaymentProof, uploadDeliverable, downloadDeliverable } = useProjects(user);
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
    if (projects.length > 0 && slugOrId) {
      let found: DatabaseProject | undefined;
      
      // Check if it's a UUID (backward compatibility)
      if (isUUID(slugOrId)) {
        found = projects.find((p) => p.id === slugOrId);
        // If found by UUID, redirect to slug URL
        if (found) {
          navigate(`/project/${found.slug}`, { replace: true });
          return;
        }
      } else {
        // Find by slug
        found = projects.find((p) => p.slug === slugOrId);
      }
      
      setProject(found || null);
    }
  }, [projects, slugOrId, navigate]);

  return {
    user,
    profile,
    project,
    loading,
    userCurrency,
    updateMilestoneStatus,
    uploadPaymentProof,
    uploadDeliverable,
    downloadDeliverable
  };
}
