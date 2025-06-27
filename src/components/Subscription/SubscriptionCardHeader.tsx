
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyCode, formatCurrency } from '@/lib/currency';
import { useT } from '@/lib/i18n';

interface SubscriptionCardHeaderProps {
  planId: string;
  price: number;
  interval: 'month' | 'year';
  currency: CurrencyCode;
  language: 'en' | 'ar';
}

export const SubscriptionCardHeader: React.FC<SubscriptionCardHeaderProps> = ({
  planId,
  price,
  interval,
  currency,
  language
}) => {
  const t = useT();

  const getPlanName = (planId: string) => {
    switch (planId) {
      case 'free':
        return t('free');
      case 'plus':
        return t('plus');
      case 'pro':
        return t('pro');
      default:
        return planId;
    }
  };

  return (
    <CardHeader className="text-center pb-4">
      <CardTitle className="text-lg font-medium text-gray-900">{getPlanName(planId)}</CardTitle>
      <div className="mt-3">
        <span className="text-2xl font-semibold text-gray-900">{formatCurrency(price, currency, language)}</span>
        <span className="text-sm text-gray-500 ml-1">/{interval === 'month' ? t('month') : t('year')}</span>
      </div>
    </CardHeader>
  );
};
