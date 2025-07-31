import { useQuery } from '@tanstack/react-query';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/lib/authSecurity';

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
    .single();

  if (error) {
    logSecurityEvent('profile_fetch_error', { userId, error: error.message });
    throw error;
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