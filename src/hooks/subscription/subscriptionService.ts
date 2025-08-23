
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getSubscriptionPlans } from './planUtils';
import { SubscriptionProfile } from './types';

export const createCheckoutSession = async (planId: string) => {
  const plans = getSubscriptionPlans('USD');
  const plan = plans.find(p => p.id === planId);
  
  if (!plan) {
    throw new Error('Plan not found');
  }

  // Handle free plan downgrade
  if (planId === 'free') {
    toast.success('Successfully downgraded to free plan!');
    return;
  }

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Call the create-checkout function
  const { data, error: functionError } = await supabase.functions.invoke('create-checkout', {
    body: {
      storeId: plan.storeId,
      variantId: plan.variantId,
    },
  });

  if (functionError) {
    throw new Error(functionError.message || 'Failed to create checkout');
  }

  // Handle both string and object responses
  let responseData = data;
  if (typeof data === 'string') {
    try {
      responseData = JSON.parse(data);
    } catch (parseError) {
      throw new Error('Invalid response format from payment provider');
    }
  }

  // Extract checkout URL
  const checkoutUrl = responseData?.checkout_url;

  if (checkoutUrl && typeof checkoutUrl === 'string' && checkoutUrl.trim()) {
    toast.success('Redirecting to checkout...');
    setTimeout(() => {
      window.location.href = checkoutUrl;
    }, 500);
  } else {
    throw new Error('No checkout URL received from payment provider');
  }
};

export const checkSubscriptionStatus = async (): Promise<SubscriptionProfile | null> => {
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
    return null;
  }
};
