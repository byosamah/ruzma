import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/core/useAuth';
import { checkSubscriptionStatus } from './subscriptionService';
import { validateSubscriptionAccess, validateProjectCreation, type SubscriptionValidationResult, type FeatureAccess } from '@/lib/subscriptionValidator';
import type { SubscriptionProfile } from './types';

/**
 * Hook for getting current subscription status
 */
export function useSubscription() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: checkSubscriptionStatus,
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for validating subscription access to features
 */
export function useSubscriptionValidation(requiredFeatures?: keyof FeatureAccess | Array<keyof FeatureAccess>) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscriptionValidation', user?.id, requiredFeatures],
    queryFn: async (): Promise<SubscriptionValidationResult> => {
      if (!user?.id) {
        return {
          isValid: false,
          userType: 'free',
          status: 'unauthenticated',
          canAccessFeature: false,
          isTrialExpired: false,
          isGracePeriod: false,
        };
      }
      
      return validateSubscriptionAccess(user.id, requiredFeatures);
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to check if user can access a specific feature
 */
export function useFeatureAccess(feature: keyof FeatureAccess) {
  const { data: validation, isLoading } = useSubscriptionValidation(feature);
  
  return {
    canAccess: validation?.canAccessFeature ?? false,
    userType: validation?.userType ?? 'free',
    isLoading,
    validation,
  };
}

/**
 * Hook to check subscription status with user-friendly helpers
 */
export function useSubscriptionStatus() {
  const { data: subscription, isLoading, error } = useSubscription();
  const { data: validation } = useSubscriptionValidation();

  const isSubscribed = subscription?.user_type !== 'free';
  const isPremium = ['plus', 'pro'].includes(subscription?.user_type || '');
  const isOnTrial = subscription?.subscription_status === 'on_trial';
  const isActive = subscription?.subscription_status === 'active';
  const isExpired = validation?.isTrialExpired || subscription?.subscription_status === 'expired';
  const inGracePeriod = validation?.isGracePeriod || subscription?.subscription_status === 'unpaid';

  return {
    subscription,
    validation,
    isLoading,
    error,
    // Status helpers
    isSubscribed,
    isPremium,
    isOnTrial,
    isActive,
    isExpired,
    inGracePeriod,
    isFree: subscription?.user_type === 'free',
    // Plan helpers
    isPlus: subscription?.user_type === 'plus',
    isPro: subscription?.user_type === 'pro',
    // Access helpers
    canCreateUnlimitedProjects: validation?.canAccessFeature === true && subscription?.user_type === 'pro',
    hasCustomBranding: isPremium && (validation?.canAccessFeature !== false),
    hasAdvancedAnalytics: isPremium && (validation?.canAccessFeature !== false),
    hasPrioritySupport: subscription?.user_type === 'pro' && (validation?.canAccessFeature !== false),
  };
}

/**
 * Hook for project creation limits
 */
export function useProjectLimits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projectLimits', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      return validateProjectCreation(user.id);
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook for trial status and countdown
 */
export function useTrialStatus() {
  const { data: validation } = useSubscriptionValidation();
  const { subscription } = useSubscriptionStatus();

  const isOnTrial = subscription?.subscription_status === 'on_trial';
  const trialEndsAt = validation?.expires_at ? new Date(validation.expires_at) : null;
  const daysLeft = validation?.daysUntilExpiry;

  const getTrialMessage = () => {
    if (!isOnTrial || !daysLeft) return null;

    if (daysLeft <= 0) {
      return 'Your trial has expired. Upgrade to continue using premium features.';
    } else if (daysLeft === 1) {
      return 'Your trial ends tomorrow. Upgrade now to avoid service interruption.';
    } else if (daysLeft <= 3) {
      return `Your trial ends in ${daysLeft} days. Upgrade now to continue using premium features.`;
    } else {
      return `You have ${daysLeft} days left in your trial.`;
    }
  };

  return {
    isOnTrial,
    trialEndsAt,
    daysLeft,
    trialMessage: getTrialMessage(),
    isTrialExpiring: Boolean(daysLeft && daysLeft <= 3),
    isTrialExpired: validation?.isTrialExpired || false,
  };
}

export type { SubscriptionProfile, SubscriptionValidationResult, FeatureAccess };