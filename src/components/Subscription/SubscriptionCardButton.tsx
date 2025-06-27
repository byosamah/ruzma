
import React from 'react';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

interface SubscriptionCardButtonProps {
  planId: string;
  isCurrentPlan: boolean;
  isLoading: boolean;
  currentUserType: string;
  isPopular: boolean;
  onSelectPlan: (planId: string) => void;
}

export const SubscriptionCardButton: React.FC<SubscriptionCardButtonProps> = ({
  planId,
  isCurrentPlan,
  isLoading,
  currentUserType,
  isPopular,
  onSelectPlan
}) => {
  const t = useT();

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
    const targetTier = getPlanTierValue(planId);
    return currentTier > targetTier;
  };

  const isUpgrade = () => {
    const currentTier = getPlanTierValue(currentUserType);
    const targetTier = getPlanTierValue(planId);
    return currentTier < targetTier;
  };

  const getButtonText = () => {
    if (isCurrentPlan) {
      return t('currentPlan');
    }
    if (isLoading) {
      return t('processing');
    }
    if (isDowngrade()) {
      return t('downgrade');
    }
    if (isUpgrade()) {
      return t('upgrade');
    }
    return t('choosePlanButton');
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) {
      return 'secondary' as const;
    }
    if (isPopular || isUpgrade()) {
      return 'default' as const;
    }
    return 'outline' as const;
  };

  const isButtonDisabled = () => {
    return isLoading || isCurrentPlan || planId === 'pro';
  };

  return (
    <CardFooter className="pt-0">
      <Button
        onClick={() => onSelectPlan(planId)}
        disabled={isButtonDisabled()}
        className="w-full"
        variant={getButtonVariant()}
      >
        {getButtonText()}
      </Button>
    </CardFooter>
  );
};
