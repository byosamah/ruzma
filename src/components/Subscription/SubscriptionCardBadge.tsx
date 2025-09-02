
import { Badge } from '@/components/ui/badge';
import { useT } from '@/lib/i18n';

interface SubscriptionCardBadgeProps {
  isCurrentPlan: boolean;
  isPopular: boolean;
  currentUserType?: string;
  planId?: string;
}

export function SubscriptionCardBadge({
  isCurrentPlan,
  isPopular,
  currentUserType = 'free',
  planId
}: SubscriptionCardBadgeProps) {
  const t = useT();

  if (isCurrentPlan) {
    return (
      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white hover:bg-gray-800 px-3 py-1">
        {t('currentPlan')}
      </Badge>
    );
  }
  
  if (isPopular) {
    // Show "Coming Soon" for Free and Plus users looking at Pro plan
    const shouldShowComingSoon = (currentUserType === 'free' || currentUserType === 'plus') && planId === 'pro';
    
    return (
      <Badge className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 ${
        shouldShowComingSoon 
          ? 'bg-gray-500 text-white hover:bg-gray-600' 
          : 'bg-gray-900 text-white hover:bg-gray-800'
      }`}>
        {shouldShowComingSoon ? t('comingSoon') : t('recommended')}
      </Badge>
    );
  }
  
  return null;
};
