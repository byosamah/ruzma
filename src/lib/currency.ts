
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

// Country-Currency mapping utilities
export const getCurrencyByCountry = (countryCode: string): CurrencyCode => {
  // Map common countries to currencies
  const countryToCurrency: Record<string, CurrencyCode> = {
    'SA': 'SAR',
    'JO': 'JOD', 
    'AE': 'AED',
    'EG': 'EGP',
    'US': 'USD',
    'GB': 'GBP',
    'CA': 'USD',
    'AU': 'USD',
    'DE': 'USD',
    'FR': 'USD',
    'KW': 'USD',
    'QA': 'USD',
    'BH': 'USD',
    'OM': 'USD',
    'LB': 'USD',
    'MA': 'USD',
    'TN': 'USD',
    'DZ': 'USD'
  };
  
  return countryToCurrency[countryCode] || 'USD';
};

export const getCountryByCurrency = (currency: CurrencyCode): string | undefined => {
  const currencyToCountry: Record<CurrencyCode, string> = {
    'SAR': 'SA',
    'JOD': 'JO',
    'AED': 'AE', 
    'EGP': 'EG',
    'USD': 'US',
    'GBP': 'GB'
  };
  
  return currencyToCountry[currency];
};
