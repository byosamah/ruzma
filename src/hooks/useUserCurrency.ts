
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { CurrencyCode, formatCurrency as formatCurrencyUtil } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';

export const useUserCurrency = (profile: any = null) => {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const { language } = useLanguage();

  useEffect(() => {
    if (profile?.currency) {
      setCurrency(profile.currency as CurrencyCode);
    }
  }, [profile]);

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency, language);
  };

  return { currency, formatCurrency };
};
