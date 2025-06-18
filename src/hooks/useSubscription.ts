
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  storeId?: string;
  variantId?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '1 project',
      '500MB storage',
      'Basic support',
      'Standard analytics',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 9.99,
    interval: 'month',
    features: [
      '3 projects',
      '10GB storage',
      'Priority support',
      'Advanced analytics',
    ],
    storeId: '148628',
    variantId: '697231',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    interval: 'month',
    features: [
      '10 projects',
      '50GB storage',
      'Priority support',
      'Advanced analytics',
    ],
    storeId: '148628',
    variantId: '697237',
  },
];

export const useSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckout = async (planId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Handle free plan downgrade
      if (planId === 'free') {
        toast.success('Successfully downgraded to free plan!');
        // You could add actual downgrade logic here by calling a Supabase function
        return;
      }

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating checkout for plan:', plan);
      console.log('User details:', { id: user.id, email: user.email });

      // Call the create-checkout function
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout', {
        body: {
          storeId: plan.storeId,
          variantId: plan.variantId,
        },
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Failed to create checkout');
      }

      console.log('Create-checkout response:', data);

      // Handle both string and object responses
      let responseData = data;
      if (typeof data === 'string') {
        try {
          responseData = JSON.parse(data);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          throw new Error('Invalid response format from payment provider');
        }
      }

      // Extract checkout URL
      const checkoutUrl = responseData?.checkout_url;
      console.log('Extracted checkout URL:', checkoutUrl);

      if (checkoutUrl && typeof checkoutUrl === 'string' && checkoutUrl.trim()) {
        console.log('Redirecting to checkout:', checkoutUrl);
        // Show success message before redirect
        toast.success('Redirecting to checkout...');
        // Open in same tab instead of new tab
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 500);
      } else {
        console.error('No valid checkout URL found in response:', responseData);
        throw new Error('No checkout URL received from payment provider');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create checkout';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Checkout creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, subscription_status, subscription_id')
        .eq('id', user.id)
        .single();

      return profile;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return null;
    }
  };

  const mapUserTypeToPlanId = (userType: string): string | null => {
    switch (userType) {
      case 'plus':
        return 'plus';
      case 'pro':
        return 'pro';
      case 'free':
      default:
        return 'free';
    }
  };

  return {
    createCheckout,
    checkSubscriptionStatus,
    mapUserTypeToPlanId,
    isLoading,
    error,
    plans: SUBSCRIPTION_PLANS,
  };
};
