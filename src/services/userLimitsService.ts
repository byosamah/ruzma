import { supabase } from '@/integrations/supabase/client';

interface UserLimits {
  project_limit: number;
  storage_limit_bytes: number;
}

export const getUserLimits = async (userType: string = 'free'): Promise<UserLimits> => {
  try {
    // Since get_user_limits function doesn't exist, query the table directly
    const { data, error } = await supabase
      .from('user_plan_limits')
      .select('project_limit, storage_limit_bytes')
      .eq('user_type', userType)
      .single();

    if (error) {
      console.error('Error fetching user limits:', error);
      // Return fallback limits if database call fails
      return getFallbackLimits(userType);
    }

    if (data) {
      return {
        project_limit: data.project_limit,
        storage_limit_bytes: data.storage_limit_bytes
      };
    }

    // Return fallback if no data found
    return getFallbackLimits(userType);
  } catch (error) {
    console.error('Error in getUserLimits:', error);
    return getFallbackLimits(userType);
  }
};

const getFallbackLimits = (userType: string): UserLimits => {
  switch (userType) {
    case 'plus':
      return { project_limit: 999999, storage_limit_bytes: 10737418240 }; // Unlimited projects, 10GB
    case 'pro':
      return { project_limit: 999999, storage_limit_bytes: 53687091200 }; // Unlimited projects, 50GB
    case 'free':
    default:
      return { project_limit: 1, storage_limit_bytes: 524288000 }; // 1 project, 500MB
  }
};