
import React from 'react';
import { SubscriptionCard } from './SubscriptionCard';
import { useSubscription } from '@/hooks/useSubscription';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

export const SubscriptionPlans: React.FC = () => {
  const { plans, createCheckout, isLoading } = useSubscription();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

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

  const getCurrentPlanId = (userType: string) => {
    switch (userType) {
      case 'plus':
        return 'plus';
      case 'pro':
        return 'pro';
      default:
        return null;
    }
  };

  const currentPlanId = userProfile?.user_type ? getCurrentPlanId(userProfile.user_type) : null;

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Choose Your Plan</h2>
          <p className="text-muted-foreground mt-2">
            Loading your current subscription...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">
          Upgrade your account to unlock more features and storage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan, index) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            isPopular={index === 0}
            isCurrentPlan={currentPlanId === plan.id}
            onSelectPlan={createCheckout}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};
