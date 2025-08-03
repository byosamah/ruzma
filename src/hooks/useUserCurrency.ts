
import { useState, useEffect } from 'react';
import { CurrencyCode, formatCurrency as formatCurrencyUtil } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/core/useAuth';
import { ServiceRegistry } from '@/services/core/ServiceRegistry';

export const useUserCurrency = (profile: any = null) => {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const { language } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (profile?.currency) {
      setCurrency(profile.currency as CurrencyCode);
    }
  }, [profile]);

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency, language);
  };

  // Centralized currency service access
  const getCurrencyService = () => {
    const registry = ServiceRegistry.getInstance();
    return registry.getCurrencyService(user);
  };

  return { 
    currency, 
    formatCurrency,
    currencyService: getCurrencyService()
  };
};
