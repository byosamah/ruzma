
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { UserSubscription, CheckoutSessionData } from '@/types/subscription';
import {
  fetchUserSubscription,
  createLemonSqueezyCheckout,
  checkUserLimits as checkLimits,
  updateUserStorage as updateStorage,
  updateProjectCount as updateCount,
} from '@/services/subscriptionService';
import {
  formatStorageSize,
  getStorageLimit,
  getProjectLimit,
} from '@/utils/subscriptionUtils';

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
      const data = await fetchUserSubscription(user);
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
      console.log('Creating checkout session for user:', user.id);
      
      const checkoutData: CheckoutSessionData = {
        user_id: user.id,
        variant_id: 697231,
        store_id: '148628',
        webhook_url: 'https://***REMOVED***.supabase.co/functions/v1/lemon-webhook',
        redirect_url: `${window.location.origin}/dashboard?upgraded=true`,
        receipt_link_url: `${window.location.origin}/dashboard`,
      };

      const checkoutUrl = await createLemonSqueezyCheckout(checkoutData);
      return checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      if (error instanceof Error) {
        toast.error(`Failed to start checkout: ${error.message}`);
      } else {
        toast.error('Failed to start checkout process');
      }
      return null;
    }
  };

  const checkUserLimits = async (action: 'project' | 'storage', size: number = 0): Promise<boolean> => {
    if (!user) return false;
    return checkLimits(user.id, action, size);
  };

  const updateUserStorage = async (sizeChange: number) => {
    if (!user) return;

    try {
      await updateStorage(user.id, sizeChange);
      await fetchSubscription(); // Refresh subscription data
    } catch (error) {
      console.error('Error updating user storage:', error);
    }
  };

  const updateProjectCount = async (countChange: number) => {
    if (!user) return;

    try {
      await updateCount(user.id, countChange);
      await fetchSubscription(); // Refresh subscription data
    } catch (error) {
      console.error('Error updating project count:', error);
    }
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

export type { UserSubscription };
