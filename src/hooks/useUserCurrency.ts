
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { CurrencyCode, formatCurrency as formatCurrencyUtil } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';

export const useUserCurrency = (profile: any = null) => {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const { language } = useLanguage();

  useEffect(() => {
    const fetchUserCurrency = async () => {
      console.log('useUserCurrency: called with profile:', !!profile);
      
      if (!profile) {
        console.log('useUserCurrency: No profile, using default USD');
        setCurrency('USD');
        return;
      }
        
      if (profile?.currency) {
        console.log('useUserCurrency: Setting currency from profile:', profile.currency);
        setCurrency(profile.currency as CurrencyCode);
      } else {
        console.log('useUserCurrency: No currency in profile, using USD');
        setCurrency('USD');
      }
    };

    fetchUserCurrency();
  }, [profile]);

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency, language);
  };

  return { currency, formatCurrency };
};
