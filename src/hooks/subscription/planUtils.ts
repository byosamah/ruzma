
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
        '✅ 1 project',
        '🔗 Link sharing',
        '🧑‍💻 Basic support',
      ],
    },
    {
      id: 'plus',
      name: 'Monthly',
      price: Math.round(19 * rate * 100) / 100,
      originalPrice: Math.round(39 * rate * 100) / 100,
      interval: 'month',
      features: [
        '✅ Unlimited projects',
        '💡 AI Assistant (Coming soon)',
        '💰 Asking for Payment Proof',
        '📩 Client Email Reminder System',
        '🖼️ Branded Client Portal',
        '🧾 Invoice Generator',
        '📊 Analytics Dashboard',
      ],
      storeId: '148628',
      variantId: '697231',
    },
    {
      id: 'pro',
      name: 'Lifetime',
      price: Math.round(349 * rate * 100) / 100,
      originalPrice: Math.round(450 * rate * 100) / 100,
      interval: 'month',
      features: [
        '🔓 Access forever',
        '✅ Unlimited projects',
        '💰 Asking for Payment Proof',
        '📩 Client Email Reminder System',
        '🖼️ Branded Client Portal',
        '🧾 Invoice Generator',
        '📊 Analytics Dashboard',
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
