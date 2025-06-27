
import React from 'react';
import { SubscriptionCard } from './SubscriptionCard';
import { useSubscription } from '@/hooks/useSubscription';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useT } from '@/lib/i18n';

export const SubscriptionPlans: React.FC = () => {
  const t = useT();
  const { createCheckout, isLoading, getPlansForCurrency } = useSubscription();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { currency } = useUserCurrency(user);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type, subscription_status')
            .eq('id', user.id)
            .single();
          
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserAndProfile();
  }, []);

  // Get plans with user's preferred currency
  const plans = getPlansForCurrency(currency);

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
        return 'plus'; // Highlight Plus as "Most Popular" for free users
      case 'plus':
        return 'pro'; // Highlight Pro as "Upgrade your work" for plus users
      case 'pro':
      default:
        return null; // No highlighting for pro users
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
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t('choosePlan')}</h2>
          <p className="text-muted-foreground mt-2">
            {t('loading')}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
