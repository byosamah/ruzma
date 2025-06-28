
export const CURRENCIES = {
  SAR: { 
    symbol: { en: 'SAR', ar: 'ر.س' }, 
    name: 'Saudi Riyal' 
  },
  JOD: { 
    symbol: { en: 'JOD', ar: 'د.ا' }, 
    name: 'Jordanian Dinar' 
  },
  USD: { 
    symbol: { en: '$', ar: '$' }, 
    name: 'US Dollar' 
  },
  AED: { 
    symbol: { en: 'AED', ar: 'د.إ' }, 
    name: 'UAE Dirham' 
  },
  GBP: { 
    symbol: { en: '£', ar: '£' }, 
    name: 'British Pound' 
  },
  EGP: { 
    symbol: { en: 'EGP', ar: 'ج.م' }, 
    name: 'Egyptian Pound' 
  }
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

// Export currencies array for compatibility
export const currencies = Object.entries(CURRENCIES).map(([code, data]) => ({
  code: code as CurrencyCode,
  name: data.name,
  symbol: data.symbol
}));

export const formatCurrency = (amount: number, currency: CurrencyCode = 'USD', language: 'en' | 'ar' = 'en'): string => {
  // Add safety check for undefined currency
  if (!currency || !CURRENCIES[currency]) {
    console.warn('Invalid currency code:', currency, 'defaulting to USD');
    currency = 'USD';
  }
  
  const { symbol } = CURRENCIES[currency];
  const currencySymbol = symbol[language];
  return `${currencySymbol}${amount.toLocaleString()}`;
};

export const getCurrencySymbol = (currency: CurrencyCode = 'USD', language: 'en' | 'ar' = 'en'): string => {
  if (!currency || !CURRENCIES[currency]) {
    console.warn('Invalid currency code:', currency, 'defaulting to USD');
    currency = 'USD';
  }
  return CURRENCIES[currency].symbol[language];
};
