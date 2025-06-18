
import React from 'react';
import { SubscriptionCard } from './SubscriptionCard';
import { useSubscription } from '@/hooks/useSubscription';

export const SubscriptionPlans: React.FC = () => {
  const { plans, createCheckout, isLoading } = useSubscription();

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
            isPopular={index === 0} // Make the first plan popular
            onSelectPlan={createCheckout}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};
