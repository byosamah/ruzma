
import { CurrencyCode } from '@/lib/currency';
import { SubscriptionPlan } from './types';
import { BASE_PRICES, EXCHANGE_RATES } from './constants';
import { translate } from '@/lib/i18n';

export const getSubscriptionPlans = (currency: CurrencyCode = 'USD', language: 'en' | 'ar' = 'en'): SubscriptionPlan[] => {
  const rate = EXCHANGE_RATES[currency] || 1;
  
  return [
    {
      id: 'free',
      name: translate('free', language),
      price: 0,
      interval: 'month',
      features: [
        `✅ ${translate('oneProject', language)}`,
        `🔗 ${translate('linkSharing', language)}`,
        `🧑‍💻 ${translate('basicSupportBenefit', language)}`,
      ],
    },
    {
      id: 'plus',
      name: translate('plus', language),
      price: Math.round(19 * rate * 100) / 100,
      originalPrice: Math.round(39 * rate * 100) / 100,
      interval: 'month',
      features: [
        `✅ ${translate('unlimitedProjectsBenefit', language)}`,
        `💡 ${translate('aiAssistant', language)}`,
        `💰 ${translate('paymentProof', language)}`,
        `📩 ${translate('emailReminder', language)}`,
        `🖼️ ${translate('brandedPortal', language)}`,
        `🧾 ${translate('invoiceGenerator', language)}`,
        `📊 ${translate('analyticsDashboard', language)}`,
      ],
      storeId: '148628',
      variantId: '697231',
    },
    {
      id: 'pro',
      name: translate('pro', language),
      price: Math.round(349 * rate * 100) / 100,
      originalPrice: Math.round(450 * rate * 100) / 100,
      interval: 'lifetime' as any,
      features: [
        `🔓 ${translate('accessForever', language)}`,
        `✅ ${translate('unlimitedProjectsBenefit', language)}`,
        `💰 ${translate('paymentProof', language)}`,
        `📩 ${translate('emailReminder', language)}`,
        `🖼️ ${translate('brandedPortal', language)}`,
        `🧾 ${translate('invoiceGenerator', language)}`,
        `📊 ${translate('analyticsDashboard', language)}`,
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
