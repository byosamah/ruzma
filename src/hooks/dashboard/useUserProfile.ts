
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { logSecurityEvent } from '@/lib/authSecurity';

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchProfile = async () => {
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
          logSecurityEvent('profile_creation_failed', { error: createError.message });
          toast.error("Profile setup error");
        } else {
          console.log('Dashboard: New profile created');
          logSecurityEvent('profile_created', { userId: user.id });
          setProfile(newProfile);
        }
      } else {
        setProfile(profileData);
        console.log('Dashboard: Existing profile loaded');
        logSecurityEvent('profile_loaded', { userId: user.id });
      }

      setLoading(false);
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return {
    profile,
    loading,
  };
};
