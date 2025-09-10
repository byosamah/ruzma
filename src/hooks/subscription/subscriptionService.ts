
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
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get user's current profile to check if they're already on free plan
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type, subscription_id, subscription_status')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to get user profile');
    }

    if (profile.user_type === 'free' || !profile.subscription_id) {
      // User is already on free plan
      toast.success('You are already on the free plan!');
      return;
    }

    try {
      // Check if subscriptions table exists first
      const testResponse = await supabase
        .from('subscriptions')
        .select('id')
        .limit(0);

      if (!testResponse.error) {
        // Table exists, try to find subscription record
        const { data: subscription, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('lemon_squeezy_id, status, subscription_plan')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (!subscriptionError && subscription?.lemon_squeezy_id) {
          // Subscriptions table exists and we found an active subscription
          // Call the cancel-subscription function
          try {
            const { error: cancelError } = await supabase.functions.invoke('cancel-subscription', {
              body: { subscriptionId: subscription.lemon_squeezy_id }
            });

            if (cancelError) {
              throw new Error(cancelError.message || 'Failed to cancel subscription');
            }

            toast.success('Subscription cancelled successfully! You will retain access until the end of your current billing period.');
            return;

          } catch (functionError) {
            console.warn('cancel-subscription function not available:', functionError);
            // Fall back to profile-only update
          }
        }
      } else {
        console.debug('Subscriptions table does not exist, using profile-only update');
      }
    } catch (tableError) {
      console.warn('Subscriptions table not available yet:', tableError);
      // Fall back to profile-only update
    }

    // Fallback approach - just update the profile (for development or if tables don't exist yet)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        user_type: 'free',
        subscription_status: 'cancelled',
        subscription_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error('Failed to update profile');
    }

    toast.success('Downgraded to free plan! Note: To fully cancel your subscription, please contact support or visit your Lemon Squeezy customer portal.');
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

    // Get basic profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type, subscription_status, subscription_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Try to get detailed subscription info from subscriptions table if it exists
    try {
      // Check if subscriptions table exists first
      const testResponse = await supabase
        .from('subscriptions')
        .select('id')
        .limit(0);

      if (!testResponse.error) {
        const { data: subscriptions, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('status, subscription_plan, trial_ends_at, expires_at')
          .eq('user_id', user.id)
          .in('status', ['active', 'on_trial', 'unpaid'])
          .order('created_at', { ascending: false })
          .limit(1);

        // If query succeeded and we have subscription data
        if (!subscriptionError && subscriptions && subscriptions.length > 0) {
          const subscription = subscriptions[0];
          // Return enhanced profile with subscription details
          return {
            user_type: subscription.subscription_plan,
            subscription_status: subscription.status,
            subscription_id: profile.subscription_id,
            trial_ends_at: subscription.trial_ends_at,
            expires_at: subscription.expires_at
          };
        }
      } else {
        console.debug('Subscriptions table does not exist, using profile data only');
      }
    } catch (subscriptionError) {
      // Subscriptions table doesn't exist, query failed, or no active subscription found
      // Fall back to profile data
      console.debug('Subscription table query failed, using profile data:', subscriptionError);
    }

    return profile;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return null;
  }
};
