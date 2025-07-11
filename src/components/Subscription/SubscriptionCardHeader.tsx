
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyCode, formatCurrency } from '@/lib/currency';
import { useT } from '@/lib/i18n';

interface SubscriptionCardHeaderProps {
  planId: string;
  price: number;
  originalPrice?: number;
  interval: 'month' | 'year';
  currency: CurrencyCode;
  language: 'en' | 'ar';
}

export const SubscriptionCardHeader: React.FC<SubscriptionCardHeaderProps> = ({
  planId,
  price,
  originalPrice,
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
        return 'Monthly';
      case 'pro':
        return 'Lifetime';
      default:
        return planId;
    }
  };

  return (
    <CardHeader className="text-center pb-4 px-4 sm:px-6">
      <CardTitle className="text-lg sm:text-xl font-medium text-gray-900 mb-3">
        {getPlanName(planId)}
      </CardTitle>
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(originalPrice, currency, language)}
            </span>
          )}
          <span className="text-2xl sm:text-3xl font-semibold text-gray-900">
            {formatCurrency(price, currency, language)}
          </span>
        </div>
        {planId !== 'free' && (
          <p className="text-sm text-gray-500">
            /{interval === 'month' ? t('month') : t('year')}
          </p>
        )}
      </div>
    </CardHeader>
  );
};
