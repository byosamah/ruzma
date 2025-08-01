
// Re-export core functions from consolidated formatters module
export { formatCurrency, getCurrencySymbol, validateCurrency, parseAmount } from '@/lib/formatters';

export const CURRENCIES = {
  USD: { 
    symbol: { en: '$', ar: '$' }, 
    name: 'US Dollar',
    decimals: 2
  },
  EUR: { 
    symbol: { en: '€', ar: '€' }, 
    name: 'Euro',
    decimals: 2
  },
  GBP: { 
    symbol: { en: '£', ar: '£' }, 
    name: 'British Pound',
    decimals: 2
  },
  SAR: { 
    symbol: { en: 'SAR', ar: 'ر.س' }, 
    name: 'Saudi Riyal',
    decimals: 2
  },
  AED: { 
    symbol: { en: 'AED', ar: 'د.إ' }, 
    name: 'UAE Dirham',
    decimals: 2
  },
  JOD: { 
    symbol: { en: 'JOD', ar: 'د.ا' }, 
    name: 'Jordanian Dinar',
    decimals: 3
  },
  EGP: { 
    symbol: { en: 'EGP', ar: 'ج.م' }, 
    name: 'Egyptian Pound',
    decimals: 2
  },
  KWD: { 
    symbol: { en: 'KWD', ar: 'د.ك' }, 
    name: 'Kuwaiti Dinar',
    decimals: 3
  },
  QAR: { 
    symbol: { en: 'QAR', ar: 'ر.ق' }, 
    name: 'Qatari Riyal',
    decimals: 2
  },
  BHD: { 
    symbol: { en: 'BHD', ar: 'د.ب' }, 
    name: 'Bahraini Dinar',
    decimals: 3
  },
  OMR: { 
    symbol: { en: 'OMR', ar: 'ر.ع' }, 
    name: 'Omani Rial',
    decimals: 3
  },
  LBP: { 
    symbol: { en: 'LBP', ar: 'ل.ل' }, 
    name: 'Lebanese Pound',
    decimals: 2
  },
  MAD: { 
    symbol: { en: 'MAD', ar: 'د.م' }, 
    name: 'Moroccan Dirham',
    decimals: 2
  },
  TND: { 
    symbol: { en: 'TND', ar: 'د.ت' }, 
    name: 'Tunisian Dinar',
    decimals: 3
  },
  DZD: { 
    symbol: { en: 'DZD', ar: 'د.ج' }, 
    name: 'Algerian Dinar',
    decimals: 2
  },
  CAD: { 
    symbol: { en: 'CAD', ar: 'CAD' }, 
    name: 'Canadian Dollar',
    decimals: 2
  },
  AUD: { 
    symbol: { en: 'AUD', ar: 'AUD' }, 
    name: 'Australian Dollar',
    decimals: 2
  },
  CHF: { 
    symbol: { en: 'CHF', ar: 'CHF' }, 
    name: 'Swiss Franc',
    decimals: 2
  },
  JPY: { 
    symbol: { en: '¥', ar: '¥' }, 
    name: 'Japanese Yen',
    decimals: 0
  }
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

// Legacy implementations moved to formatters module

// Country-Currency mapping utilities
export const getCurrencyByCountry = (countryCode: string): CurrencyCode => {
  // Map countries to their primary currencies
  const countryToCurrency: Record<string, CurrencyCode> = {
    'SA': 'SAR',
    'JO': 'JOD', 
    'AE': 'AED',
    'EG': 'EGP',
    'KW': 'KWD',
    'QA': 'QAR',
    'BH': 'BHD',
    'OM': 'OMR',
    'LB': 'LBP',
    'MA': 'MAD',
    'TN': 'TND',
    'DZ': 'DZD',
    'US': 'USD',
    'GB': 'GBP',
    'CA': 'CAD',
    'AU': 'AUD',
    'DE': 'EUR',
    'FR': 'EUR',
    'CH': 'CHF',
    'JP': 'JPY'
  };
  
  return countryToCurrency[countryCode] || 'USD';
};

export const getPossibleCountriesByCurrency = (currency: CurrencyCode): string[] => {
  const currencyToCountries: Record<CurrencyCode, string[]> = {
    'SAR': ['SA'],
    'JOD': ['JO'],
    'AED': ['AE'],
    'EGP': ['EG'],
    'KWD': ['KW'],
    'QAR': ['QA'],
    'BHD': ['BH'],
    'OMR': ['OM'],
    'LBP': ['LB'],
    'MAD': ['MA'],
    'TND': ['TN'],
    'DZD': ['DZ'],
    'USD': ['US'],
    'GBP': ['GB'],
    'CAD': ['CA'],
    'AUD': ['AU'],
    'EUR': ['DE', 'FR'],
    'CHF': ['CH'],
    'JPY': ['JP']
  };
  
  return currencyToCountries[currency] || [];
};

export const getCountryByCurrency = (currency: CurrencyCode): string | undefined => {
  const countries = getPossibleCountriesByCurrency(currency);
  return countries.length === 1 ? countries[0] : undefined;
};

// Currency search utilities
export const getPopularCurrencies = (): CurrencyCode[] => {
  return ['USD', 'EUR', 'SAR', 'AED', 'GBP', 'JOD', 'EGP'];
};

export const getAllCurrencies = (): CurrencyCode[] => {
  return Object.keys(CURRENCIES) as CurrencyCode[];
};

export const searchCurrencies = (query: string, language: 'en' | 'ar' = 'en'): CurrencyCode[] => {
  if (!query) return getPopularCurrencies();
  
  const searchQuery = query.toLowerCase();
  return Object.entries(CURRENCIES)
    .filter(([code, currency]) => 
      code.toLowerCase().includes(searchQuery) ||
      currency.name.toLowerCase().includes(searchQuery) ||
      currency.symbol[language].toLowerCase().includes(searchQuery)
    )
    .map(([code, _]) => code as CurrencyCode);
};
