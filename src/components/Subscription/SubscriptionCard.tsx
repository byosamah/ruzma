
import React from 'react';
import { Card } from '@/components/ui/card';
import { SubscriptionPlan } from '@/hooks/subscription/useSubscription';
import { CurrencyCode } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';
import { SubscriptionCardBadge } from './SubscriptionCardBadge';
import { SubscriptionCardHeader } from './SubscriptionCardHeader';
import { SubscriptionCardFeatures } from './SubscriptionCardFeatures';
import { SubscriptionCardButton } from './SubscriptionCardButton';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  currency: CurrencyCode;
  isPopular?: boolean;
  popularText?: string;
  isCurrentPlan?: boolean;
  currentUserType?: string;
  onSelectPlan: (planId: string) => void;
  isLoading?: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  plan,
  currency,
  isPopular = false,
  popularText = 'Most Popular',
  isCurrentPlan = false,
  currentUserType = 'free',
  onSelectPlan,
  isLoading = false
}) => {
  const { language } = useLanguage();
  
  const getCardClassName = () => {
    if (isCurrentPlan) {
      return 'relative border-2 border-gray-900 bg-gray-50/30';
    }
    if (isPopular) {
      return 'relative border-2 border-gray-900 bg-white shadow-sm';
    }
    return 'relative border border-gray-200 bg-white hover:border-gray-300 transition-colors';
  };

  return (
    <Card className={getCardClassName()}>
      <SubscriptionCardBadge 
        isCurrentPlan={isCurrentPlan}
        isPopular={isPopular}
        currentUserType={currentUserType}
        planId={plan.id}
      />
      
      <SubscriptionCardHeader
        planId={plan.id}
        price={plan.price}
        originalPrice={plan.originalPrice}
        interval={plan.interval}
        currency={currency}
        language={language}
      />

      <SubscriptionCardFeatures features={plan.features} />

      <SubscriptionCardButton
        planId={plan.id}
        isCurrentPlan={isCurrentPlan}
        isLoading={isLoading}
        currentUserType={currentUserType}
        isPopular={isPopular}
        onSelectPlan={onSelectPlan}
      />
    </Card>
  );
};
