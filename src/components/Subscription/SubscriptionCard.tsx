
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown } from 'lucide-react';
import { SubscriptionPlan } from '@/hooks/useSubscription';
import { CurrencyCode, formatCurrency } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';

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
      return 'relative border-green-500 bg-green-50/50';
    }
    if (isPopular) {
      return 'relative border-primary shadow-lg scale-105';
    }
    return 'relative';
  };

  const getBadge = () => {
    if (isCurrentPlan) {
      return (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 hover:bg-green-600">
          Current Plan
        </Badge>
      );
    }
    if (isPopular) {
      return (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
          Coming Soon
        </Badge>
      );
    }
    return null;
  };

  const getPlanTierValue = (planId: string): number => {
    switch (planId) {
      case 'free':
        return 0;
      case 'plus':
        return 1;
      case 'pro':
        return 2;
      default:
        return 0;
    }
  };

  const isDowngrade = () => {
    const currentTier = getPlanTierValue(currentUserType);
    const targetTier = getPlanTierValue(plan.id);
    return currentTier > targetTier;
  };

  const isUpgrade = () => {
    const currentTier = getPlanTierValue(currentUserType);
    const targetTier = getPlanTierValue(plan.id);
    return currentTier < targetTier;
  };

  const getButtonText = () => {
    if (isCurrentPlan) {
      return 'Current Plan';
    }
    if (isLoading) {
      return 'Processing...';
    }
    if (isDowngrade()) {
      return 'Downgrade';
    }
    if (isUpgrade()) {
      return 'Upgrade';
    }
    return 'Choose Plan';
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) {
      return 'secondary' as const;
    }
    if (isDowngrade()) {
      return 'outline' as const;
    }
    if (isPopular) {
      return 'default' as const;
    }
    return 'outline' as const;
  };

  const isButtonDisabled = () => {
    return isLoading || isCurrentPlan || plan.id === 'pro';
  };

  return (
    <Card className={getCardClassName()}>
      {getBadge()}
      
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">{formatCurrency(plan.price, currency, language)}</span>
          <span className="text-muted-foreground">/{plan.interval}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onSelectPlan(plan.id)}
          disabled={isButtonDisabled()}
          className="w-full"
          variant={getButtonVariant()}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
};
