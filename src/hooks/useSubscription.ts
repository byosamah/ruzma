
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserSubscription {
  user_type: 'free' | 'plus';
  storage_used: number;
  project_count: number;
  subscription_status?: string;
  grace_period_end?: string;
}

export const useSubscription = (user: User | null) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type, storage_used, project_count, subscription_status, grace_period_end')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async () => {
    if (!user) {
      toast.error('Please log in to upgrade');
      return null;
    }

    try {
      const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJmYzE0ZjJkZDgxYmQ0YjVjZTA4ZDdlZTU0MDZiMTBhNzY0OTQ1ZGRhMGI4M2U1NmQzZGI5NmZkZTVlOWM2ZjQwMmNjYjhjMTNkOGFlYTYwMSIsImlhdCI6MTc1MDE3NDI3NC4wNzAwNTUsIm5iZiI6MTc1MDE3NDI3NC4wNzAwNTcsImV4cCI6MjA2NTcwNzA3NC4wMTg1ODEsInN1YiI6IjIzMTEwMzgiLCJzY29wZXMiOltdfQ.i4FARwahHq9yutCCVxoxVk_yQLJNqyfBqRaT4PZN4Us1kFb57yEQsI616zBACxdMwZgseffAMQic-UleIMNlOrk1d5VlaNZTYef_jUNRqvMOi2Azgo4LKREnZmS3um7gNHGdEkKwCUlOXFT__CTtQLO3uQW854riTk0iUubnrm1uazy068kWKmo91DhtwHr3FcFK9ayuTZKnvjsFAGicT5XAd5gAW8rpJxa6e7aO4In3CrNkX4mGHGXPiT1WZi-ztP_hb0zWtX22wES8puKFVwXb4HXUhIuVY_t2dmMx7GyZ_K7EsB2VbMHcQtxApaNjlmLB5H3m-Hk320cZ6GmnR8woGodICffPoPeJW9_OvxiB42iK1XhNZEJ-KcJ1ZjCPp92eU4uz8zzLIHWuqKgdyeBg5RxuRTGQ1mGC9Mo5ytz6R-xL1gDLm3CG559NVNSAlLMwL27NMedjr11_5A7f-5OgVR2KwEMMax9VmpG383jukEn4a8MPKJIY-bBe2j-C',
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'checkouts',
            attributes: {
              checkout_options: {
                embed: false,
                media: true,
                logo: true,
              },
              checkout_data: {
                variant_id: 697231,
                custom_data: {
                  user_id: user.id,
                },
              },
              product_options: {
                enabled_variants: [697231],
                redirect_url: `${window.location.origin}/dashboard?upgraded=true`,
                receipt_link_url: `${window.location.origin}/dashboard`,
              },
            },
            relationships: {
              store: {
                data: {
                  type: 'stores',
                  id: '94d59cef-dbb8-4ea5-b178-d2540fcd6919',
                },
              },
              variant: {
                data: {
                  type: 'variants',
                  id: '697231',
                },
              },
            },
          },
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.errors?.[0]?.detail || 'Failed to create checkout session');
      }

      return data.data.attributes.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout process');
      return null;
    }
  };

  const checkUserLimits = async (action: 'project' | 'storage', size: number = 0): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_user_limits', {
        _user_id: user.id,
        _action: action,
        _size: size
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking user limits:', error);
      return false;
    }
  };

  const updateUserStorage = async (sizeChange: number) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_user_storage', {
        _user_id: user.id,
        _size_change: sizeChange
      });

      if (error) throw error;
      await fetchSubscription(); // Refresh subscription data
    } catch (error) {
      console.error('Error updating user storage:', error);
    }
  };

  const updateProjectCount = async (countChange: number) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_project_count', {
        _user_id: user.id,
        _count_change: countChange
      });

      if (error) throw error;
      await fetchSubscription(); // Refresh subscription data
    } catch (error) {
      console.error('Error updating project count:', error);
    }
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStorageLimit = (userType: 'free' | 'plus'): number => {
    return userType === 'free' ? 524288000 : 10737418240; // 500MB vs 10GB in bytes
  };

  const getProjectLimit = (userType: 'free' | 'plus'): number => {
    return userType === 'free' ? 2 : Infinity;
  };

  return {
    subscription,
    loading,
    createCheckoutSession,
    checkUserLimits,
    updateUserStorage,
    updateProjectCount,
    formatStorageSize,
    getStorageLimit,
    getProjectLimit,
    refreshSubscription: fetchSubscription,
  };
};
