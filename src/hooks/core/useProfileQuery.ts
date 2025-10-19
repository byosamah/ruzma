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
    .select('id, full_name, email, currency, user_type, subscription_status, subscription_id, project_count, storage_used, created_at, updated_at, company, website, bio, country')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    logSecurityEvent('profile_fetch_error', { userId, error: error.message });
    console.error('Profile fetch error:', error);
    throw error;
  }

  if (!profileData) {
    console.warn('No profile found for user:', userId);
    return null;
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
    retry: (failureCount, error: any) => {
      // Don't retry on 406 errors (Not Acceptable)
      if (error?.code === 'PGRST116' || error?.status === 406) {
        console.error('Profile query failed with 406, not retrying:', error);
        return false;
      }
      // Retry once for other errors
      return failureCount < 1;
    },
    retryDelay: 1000, // Wait 1 second between retries
  });
};