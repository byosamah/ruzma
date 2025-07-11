
import { CurrencyCode } from '@/lib/currency';
import { SubscriptionPlan } from './types';
import { BASE_PRICES, EXCHANGE_RATES } from './constants';

export const getSubscriptionPlans = (currency: CurrencyCode = 'USD'): SubscriptionPlan[] => {
  const rate = EXCHANGE_RATES[currency] || 1;
  
  return [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        '1 project',
        'Links-sharing only',
        'Basic support',
        'Standard analytics',
      ],
    },
    {
      id: 'plus',
      name: 'Plus',
      price: Math.round(BASE_PRICES.plus * rate * 100) / 100,
      interval: 'month',
      features: [
        'Unlimited projects',
        '10GB storage',
        'Priority support',
        'Advanced analytics',
      ],
      storeId: '148628',
      variantId: '697231',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: Math.round(BASE_PRICES.pro * rate * 100) / 100,
      interval: 'month',
      features: [
        'Unlimited projects',
        '50GB storage',
        'Priority support',
        'Advanced analytics',
      ],
      storeId: '148628',
      variantId: '697237',
    },
  ];
};

export const mapUserTypeToPlanId = (userType: string): string | null => {
  switch (userType) {
    case 'plus':
      return 'plus';
    case 'pro':
      return 'pro';
    case 'free':
    default:
      return 'free';
  }
};
