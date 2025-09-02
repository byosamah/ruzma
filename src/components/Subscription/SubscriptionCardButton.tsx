
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

export function SubscriptionCardButton({
  planId,
  isCurrentPlan,
  isLoading,
  currentUserType,
  isPopular,
  onSelectPlan
}: SubscriptionCardButtonProps) {
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

  const getTrialText = () => {
    if (isCurrentPlan) return null;
    
    switch (planId) {
      case 'plus':
        return t('freeTrialSevenDays');
      case 'pro':
        return t('freeTrialFourteenDays');
      default:
        return null;
    }
  };

  const trialText = getTrialText();

  return (
    <CardFooter className="pt-0 flex-col space-y-2 px-4 sm:px-6 pb-4 sm:pb-6 mt-auto">
      <Button
        onClick={() => onSelectPlan(planId)}
        disabled={isButtonDisabled()}
        className="w-full min-h-[44px] text-sm sm:text-base"
        variant={getButtonVariant()}
      >
        {getButtonText()}
      </Button>
      {trialText && (
        <p className="text-xs text-gray-500 text-center px-2">{trialText}</p>
      )}
    </CardFooter>
  );
};
