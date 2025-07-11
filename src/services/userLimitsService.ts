
import { supabase } from '@/integrations/supabase/client';

interface UserLimits {
  project_limit: number;
  storage_limit_bytes: number;
}

export const getUserLimits = async (userType: string = 'free'): Promise<UserLimits> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_limits', { _user_type: userType });

    if (error) {
      console.error('Error fetching user limits:', error);
      // Return fallback limits if database call fails
      return getFallbackLimits(userType);
    }

    if (data && data.length > 0) {
      return {
        project_limit: data[0].project_limit,
        storage_limit_bytes: data[0].storage_limit_bytes
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
