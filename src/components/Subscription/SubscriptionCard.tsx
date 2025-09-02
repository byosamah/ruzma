
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

export function SubscriptionCard({
  plan,
  currency,
  isPopular = false,
  popularText = 'Most Popular',
  isCurrentPlan = false,
  currentUserType = 'free',
  onSelectPlan,
  isLoading = false
}: SubscriptionCardProps) {
  const { language } = useLanguage();
  
  const getCardClassName = () => {
    if (isCurrentPlan) {
      return 'relative border-2 border-gray-500 bg-gray-50/30 h-full flex flex-col';
    }
    if (isPopular) {
      return 'relative border-2 border-gray-500 bg-white shadow-sm h-full flex flex-col';
    }
    return 'relative border border-gray-300 bg-white hover:border-gray-400 transition-colors h-full flex flex-col';
  };

  return (
    <Card className={getCardClassName()}>
      <SubscriptionCardBadge 
        isCurrentPlan={isCurrentPlan}
        isPopular={isPopular}
        currentUserType={currentUserType}
        planId={plan.id}
      />
      
      <div className="flex-1 flex flex-col">
        <SubscriptionCardHeader
          planId={plan.id}
          price={plan.price}
          originalPrice={plan.originalPrice}
          interval={plan.interval}
          currency={currency}
          language={language}
        />

        <div className="flex-1">
          <SubscriptionCardFeatures features={plan.features} />
        </div>

        <SubscriptionCardButton
          planId={plan.id}
          isCurrentPlan={isCurrentPlan}
          isLoading={isLoading}
          currentUserType={currentUserType}
          isPopular={isPopular}
          onSelectPlan={onSelectPlan}
        />
      </div>
    </Card>
  );
};
