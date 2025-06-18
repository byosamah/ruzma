
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useUserProfile = (user: User | null, projectsLength: number) => {
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchUserProfile = async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_type, subscription_status, subscription_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setUserProfile(profile);
        console.log('User profile loaded:', profile);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  // Refresh profile when projects change (in case subscription was updated)
  useEffect(() => {
    if (user && projectsLength > 0) {
      fetchUserProfile();
    }
  }, [projectsLength]);

  return {
    userProfile,
    fetchUserProfile
  };
};
