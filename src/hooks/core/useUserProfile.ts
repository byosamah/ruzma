// Legacy hook - use useProfileQuery instead for new code
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { logSecurityEvent } from '@/lib/security';

interface UserProfile {
  id: string;
  full_name?: string;
  currency?: string;
  user_type?: string;
  subscription_status?: string;
  subscription_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useUserProfile = (user: User | null, dependencies: any[] = []) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single

      if (error) {
        console.error('Error fetching user profile:', error);
        logSecurityEvent('profile_fetch_error', { userId: user.id, error: error.message });
        toast.error('Failed to load profile');
        setProfile(null);
      } else if (!profileData) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            user_type: 'free',
            project_count: 0,
            storage_used: 0
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating user profile:', createError);
          logSecurityEvent('profile_create_error', { userId: user.id, error: createError.message });
          setProfile(null);
        } else {
          setProfile(newProfile);
          logSecurityEvent('profile_created', { userId: user.id });
        }
      } else {
        setProfile(profileData);
        logSecurityEvent('profile_fetched', { userId: user.id });
      }
    } catch (error) {
      console.error('Profile fetch exception:', error);
      logSecurityEvent('profile_fetch_exception', { userId: user?.id, error: String(error) });
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user?.id, ...dependencies]);

  return {
    profile,
    loading,
    fetchUserProfile
  };
};