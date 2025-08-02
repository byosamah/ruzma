import { useQuery } from '@tanstack/react-query';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/lib/security';

interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  currency?: string;
  user_type?: string;
  subscription_status?: string;
  subscription_id?: string;
  created_at?: string;
  updated_at?: string;
  company?: string;
  website?: string;
  bio?: string;
  country?: string;
}

const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle(); // Use maybeSingle instead of single to handle missing profiles

  if (error) {
    logSecurityEvent('profile_fetch_error', { userId, error: error.message });
    throw error;
  }

  if (!profileData) {
    // Create profile if it doesn't exist
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        user_type: 'free',
        project_count: 0,
        storage_used: 0
      })
      .select()
      .single();
    
    if (createError) {
      logSecurityEvent('profile_create_error', { userId, error: createError.message });
      throw createError;
    }
    
    logSecurityEvent('profile_created', { userId });
    return newProfile;
  }

  logSecurityEvent('profile_fetched', { userId });
  return profileData;
};

export const useProfileQuery = (user: User | null) => {
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};