
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { CurrencyCode, formatCurrency as formatCurrencyUtil } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';

export const useUserCurrency = (user: User | null = null) => {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const { language } = useLanguage();

  useEffect(() => {
    const fetchUserCurrency = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('currency')
        .eq('id', user.id)
        .single();
        
      if (profile?.currency) {
        setCurrency(profile.currency as CurrencyCode);
      }
    };

    fetchUserCurrency();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency, language);
  };

  return { currency, formatCurrency };
};
