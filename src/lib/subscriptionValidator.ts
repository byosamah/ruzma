import { supabase } from '@/integrations/supabase/client';
import { GRACE_PERIODS, SUBSCRIPTION_STATUS } from '@/hooks/subscription/constants';
import { mapVariantIdToUserType } from '@/hooks/subscription/planUtils';

// Plan limits configuration
export const USER_PLAN_LIMITS = {
  free: {
    maxProjects: 1,
    maxClients: 5,
    maxStorageMB: 100,
    maxInvoices: 5,
    features: {
      customBranding: false,
      advancedAnalytics: false,
      prioritySupport: false,
      whiteLabel: false,
    }
  },
  plus: {
    maxProjects: 50,
    maxClients: 100,
    maxStorageMB: 10000,
    maxInvoices: 500,
    features: {
      customBranding: true,
      advancedAnalytics: true,
      prioritySupport: false,
      whiteLabel: false,
    }
  },
  pro: {
    maxProjects: -1, // Unlimited
    maxClients: -1,
    maxStorageMB: -1,
    maxInvoices: -1,
    features: {
      customBranding: true,
      advancedAnalytics: true,
      prioritySupport: true,
      whiteLabel: true,
    }
  }
} as const;

export interface SubscriptionValidationResult {
  isValid: boolean;
  userType: 'free' | 'plus' | 'pro';
  status: string;
  canAccessFeature: boolean;
  isTrialExpired: boolean;
  isGracePeriod: boolean;
  gracePeriodType?: 'trial' | 'payment' | null;
  daysUntilExpiry?: number;
  gracePeriodEndsAt?: string;
  error?: string;
}

export interface FeatureAccess {
  customBranding: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  unlimitedProjects: boolean;
  unlimitedClients: boolean;
}

/**
 * Validates if a user's subscription allows access to specific features
 */
export async function validateSubscriptionAccess(
  userId: string,
  requiredFeatures?: keyof FeatureAccess | Array<keyof FeatureAccess>
): Promise<SubscriptionValidationResult> {
  try {
    // Get user's current subscription status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type, subscription_status, subscription_id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error in subscription validator:', profileError);
      return {
        isValid: false,
        userType: 'free',
        status: 'unknown',
        canAccessFeature: false,
        isTrialExpired: false,
        isGracePeriod: false,
        error: 'Failed to get user profile'
      };
    }

    if (!profile) {
      console.warn('No profile found for user in subscription validator:', userId);
      return {
        isValid: false,
        userType: 'free',
        status: 'unknown',
        canAccessFeature: false,
        isTrialExpired: false,
        isGracePeriod: false,
        error: 'User profile not found'
      };
    }

    const userType = profile.user_type as 'free' | 'plus' | 'pro';
    const status = profile.subscription_status || 'active';

    // Try to get detailed subscription info from subscriptions table
    let expiresAt: Date | null = null;
    let actualStatus = status;
    let subscriptions: any[] | null = null;
    let isLifetimePlan = false;

    try {
      // Check if subscriptions table exists by trying a minimal query first
      const testResponse = await supabase
        .from('subscriptions')
        .select('id')
        .limit(0);
      
      // If the table exists (no error), proceed with actual query
      if (!testResponse.error) {
        const response = await supabase
          .from('subscriptions')
          .select('status, expires_at, variant_id')
          .eq('user_id', userId)
          .in('status', ['active', 'on_trial', 'unpaid'])
          .order('created_at', { ascending: false })
          .limit(1);

        // If query succeeded and we have subscription data
        if (!response.error && response.data && response.data.length > 0) {
          subscriptions = response.data;
          const subscription = response.data[0];
          actualStatus = subscription.status;
          expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null;
          isLifetimePlan = false; // Grace period features not available yet
        }
      } else {
        console.debug('Subscriptions table does not exist, using profile data only');
      }
    } catch (subscriptionError) {
      // Subscriptions table doesn't exist or query failed
      console.debug('Subscription validation using profile data only:', subscriptionError);
    }

    // Calculate subscription state with grace periods
    const now = new Date();
    let isTrialExpired = false;
    let isGracePeriod = false;
    let gracePeriodType: 'trial' | 'payment' | null = null;
    let gracePeriodEndsAt: string | undefined;
    let daysUntilExpiry: number | undefined;

    // Simplified logic without trial_ends_at column

    if (expiresAt && actualStatus === 'active') {
      daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Simple grace period logic for unpaid status
    isGracePeriod = actualStatus === 'unpaid';
    gracePeriodType = isGracePeriod ? 'payment' : null;

    // Determine if subscription is valid (including grace periods and lifetime plans)
    const isSubscriptionValid = 
      userType !== 'free' && 
      (isLifetimePlan || // Lifetime plans are always valid
       (['active', 'on_trial', 'unpaid'].includes(actualStatus) &&
        (!isTrialExpired || isGracePeriod || actualStatus === 'active')));

    // Check feature access
    let canAccessFeature = true;
    if (requiredFeatures) {
      const features = Array.isArray(requiredFeatures) ? requiredFeatures : [requiredFeatures];
      canAccessFeature = features.every(feature => 
        checkFeatureAccess(userType, feature, isSubscriptionValid)
      );
    }

    return {
      isValid: isSubscriptionValid,
      userType,
      status: actualStatus,
      canAccessFeature,
      isTrialExpired,
      isGracePeriod,
      gracePeriodType,
      daysUntilExpiry,
      gracePeriodEndsAt,
    };

  } catch (error) {
    console.error('Subscription validation error:', error);
    return {
      isValid: false,
      userType: 'free',
      status: 'error',
      canAccessFeature: false,
      isTrialExpired: false,
      isGracePeriod: false,
      gracePeriodType: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if a user type has access to a specific feature
 */
function checkFeatureAccess(
  userType: 'free' | 'plus' | 'pro',
  feature: keyof FeatureAccess,
  isSubscriptionValid: boolean
): boolean {
  // Free users never have access to premium features
  if (userType === 'free' || !isSubscriptionValid) {
    return false;
  }

  const limits = USER_PLAN_LIMITS[userType];
  if (!limits) return false;

  switch (feature) {
    case 'customBranding':
      return limits.features.customBranding;
    case 'advancedAnalytics':
      return limits.features.advancedAnalytics;
    case 'prioritySupport':
      return limits.features.prioritySupport;
    case 'unlimitedProjects':
      return limits.maxProjects === -1 || limits.maxProjects > 1;
    case 'unlimitedClients':
      return limits.maxClients === -1 || limits.maxClients > 5;
    default:
      return false;
  }
}

/**
 * Validate project creation limits
 */
export async function validateProjectCreation(userId: string): Promise<{
  canCreate: boolean;
  currentCount: number;
  maxProjects: number;
  message?: string;
}> {
  try {
    const validation = await validateSubscriptionAccess(userId);
    const limits = USER_PLAN_LIMITS[validation.userType];

    // Get current project count
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .neq('status', 'cancelled');

    if (error) {
      throw error;
    }

    const currentCount = count || 0;
    const maxProjects = limits.maxProjects;

    if (maxProjects === -1) {
      // Unlimited
      return { canCreate: true, currentCount, maxProjects };
    }

    const canCreate = currentCount < maxProjects && validation.isValid;

    return {
      canCreate,
      currentCount,
      maxProjects,
      message: !canCreate 
        ? `You've reached your project limit (${maxProjects}). ${validation.userType === 'free' ? 'Upgrade to create more projects.' : 'Please upgrade your plan.'}`
        : undefined
    };

  } catch (error) {
    console.error('Project creation validation error:', error);
    return {
      canCreate: false,
      currentCount: 0,
      maxProjects: 1,
      message: 'Error checking project limits'
    };
  }
}

