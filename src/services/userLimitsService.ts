
import { supabase } from '@/integrations/supabase/client';

interface UserLimits {
  project_limit: number;
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

    if (data?.length) {
      return {
        project_limit: data[0].project_limit,
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
      return { project_limit: 999999 }; // Unlimited projects
    case 'pro':
      return { project_limit: 999999 }; // Unlimited projects
    case 'free':
    default:
      return { project_limit: 1 }; // 1 project
  }
};
