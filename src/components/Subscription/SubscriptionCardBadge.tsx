
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/lib/i18n';

interface SubscriptionCardBadgeProps {
  isCurrentPlan: boolean;
  isPopular: boolean;
}

export const SubscriptionCardBadge: React.FC<SubscriptionCardBadgeProps> = ({
  isCurrentPlan,
  isPopular
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
    return (
      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white hover:bg-gray-800 px-3 py-1">
        {t('recommended')}
      </Badge>
    );
  }
  
  return null;
};
