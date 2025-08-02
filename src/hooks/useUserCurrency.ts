
import { CurrencyCode, formatCurrency as formatCurrencyUtil } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';

export const useUserCurrency = (profile: any = null) => {
  const { currency } = useCurrency();
  const { language } = useLanguage();

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency, language);
  };

  return { currency, formatCurrency };
};
