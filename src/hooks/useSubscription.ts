
import { useState } from 'react';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
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
  },
];

export const useSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckout = async (planId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement checkout creation after rebuilding integration
      toast.info('Subscription integration is being rebuilt. Please check back soon!');
      console.log('Creating checkout for plan:', planId);
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
