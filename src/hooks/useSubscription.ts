
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LemonSqueezyService } from '@/services/lemonsqueezy';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  storeId: string;
  variantId: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plus',
    name: 'Plus',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited projects',
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
      'Everything in Plus',
      'Unlimited storage',
      'Team collaboration',
      'Custom integrations',
      'White-label options',
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

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating checkout for plan:', plan);

      // Call our edge function to create the checkout
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout', {
        body: {
          storeId: plan.storeId,
          variantId: plan.variantId,
          customData: {
            user_id: user.id,
            user_email: user.email,
          },
        },
      });

      console.log('Edge function response:', { data, error: functionError });

      if (functionError) {
        throw functionError;
      }

      if (data?.checkout_url) {
        // Redirect to checkout
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
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

  return {
    createCheckout,
    isLoading,
    error,
    plans: SUBSCRIPTION_PLANS,
  };
};
