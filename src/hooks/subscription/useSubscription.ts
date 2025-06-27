import { useState } from 'react';
import { toast } from 'sonner';
import { CurrencyCode } from '@/lib/currency';
import { SubscriptionPlan } from './types';
import { getSubscriptionPlans, mapUserTypeToPlanId } from './planUtils';
import { createCheckoutSession, checkSubscriptionStatus } from './subscriptionService';

// Keep the original plans for backward compatibility
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = getSubscriptionPlans('USD');

export const useSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckout = async (planId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await createCheckoutSession(planId);
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
    checkSubscriptionStatus,
    mapUserTypeToPlanId,
    isLoading,
    error,
    plans: SUBSCRIPTION_PLANS,
    getPlansForCurrency: getSubscriptionPlans,
  };
};

// Export types and utilities for external use
export type { SubscriptionPlan } from './types';
export { getSubscriptionPlans } from './planUtils';
