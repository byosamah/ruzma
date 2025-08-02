import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/core/useAuth';
import { CurrencyCode } from '@/lib/currency';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  updateCurrency: (currency: CurrencyCode) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  updateCurrency: async () => {},
});

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  // Load currency from profile on mount and when user changes
  useEffect(() => {
    if (user) {
      loadUserCurrency();
    }
  }, [user?.id]);

  // Subscribe to profile changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-currency-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.currency) {
            setCurrency(payload.new.currency as CurrencyCode);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const loadUserCurrency = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('currency')
        .eq('id', user.id)
        .single();

      if (!error && data?.currency) {
        setCurrency(data.currency as CurrencyCode);
      }
    } catch (error) {
      console.error('Error loading user currency:', error);
    }
  };

  const updateCurrency = async (newCurrency: CurrencyCode) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          currency: newCurrency,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state immediately
      setCurrency(newCurrency);
    } catch (error) {
      console.error('Error updating currency:', error);
      throw error;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};