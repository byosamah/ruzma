
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/lib/i18n';

interface SubscriptionCardBadgeProps {
  isCurrentPlan: boolean;
  isPopular: boolean;
  currentUserType?: string;
  planId?: string;
}

export const SubscriptionCardBadge: React.FC<SubscriptionCardBadgeProps> = ({
  isCurrentPlan,
  isPopular,
  currentUserType = 'free',
  planId
}) => {
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
    const badgeText = shouldShowComingSoon ? t('comingSoon') : t('recommended');
    
    // Use yellow color for "recommended" text only
    const badgeClassName = shouldShowComingSoon 
      ? "absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white hover:bg-gray-800 px-3 py-1"
      : "absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black hover:bg-yellow-400 px-3 py-1";
    
    return (
      <Badge className={badgeClassName}>
        {badgeText}
      </Badge>
    );
  }
  
  return null;
};
