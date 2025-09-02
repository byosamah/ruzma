
import { SubscriptionCard } from './SubscriptionCard';
import { useSubscription } from '@/hooks/subscription/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/profile';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSubscriptionPlans } from '@/hooks/subscription/planUtils';

export function SubscriptionPlans() {
  const t = useT();
  const { language } = useLanguage();
  const { createCheckout, isLoading } = useSubscription();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { currency } = useUserCurrency(userProfile);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type, subscription_status, currency')
            .eq('id', user.id)
            .single();
          
          setUserProfile(profile);
        }
      } catch (error) {
        // Error handling managed by react-query
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserAndProfile();
  }, []);

  // Get plans with user's preferred currency and language
  const plans = getSubscriptionPlans(currency, language);

  const getCurrentPlanId = (userType: string) => {
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

  const getPopularPlan = (currentUserType: string) => {
    switch (currentUserType) {
      case 'free':
        return 'plus';
      case 'plus':
        return 'pro';
      case 'pro':
      default:
        return null;
    }
  };

  const getPopularText = (currentUserType: string, planId: string) => {
    if (currentUserType === 'plus' && planId === 'pro') {
      return t('upgradeNow');
    }
    return t('mostPopular');
  };

  const currentPlanId = userProfile?.user_type ? getCurrentPlanId(userProfile.user_type) : 'free';
  const popularPlanId = getPopularPlan(currentPlanId);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500">{t('loading')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto px-4 sm:px-6">
        {plans.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            currency={currency}
            isPopular={plan.id === popularPlanId}
            popularText={getPopularText(currentPlanId, plan.id)}
            isCurrentPlan={currentPlanId === plan.id}
            currentUserType={currentPlanId}
            onSelectPlan={createCheckout}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};
