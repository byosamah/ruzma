// Comprehensive currency utilities
export const formatCurrency = (amount: number, currency: string = 'USD', language?: 'en' | 'ar'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getCurrencySymbol = (currency: string, language?: 'en' | 'ar'): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: '₣',
    CNY: '¥',
    SEK: 'kr',
    NZD: 'NZ$',
    MXN: '$',
    SGD: 'S$',
    HKD: 'HK$',
    NOK: 'kr',
    TRY: '₺',
    RUB: '₽',
    INR: '₹',
    BRL: 'R$',
    ZAR: 'R',
    KRW: '₩',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    ILS: '₪',
    CLP: '$',
    PHP: '₱',
    AED: 'د.إ',
    COP: '$',
    SAR: '﷼',
    MYR: 'RM',
    RON: 'lei',
    THB: '฿',
    BGN: 'лв',
    HRK: 'kn',
    IDR: 'Rp',
    ISK: 'kr',
    UAH: '₴'
  };
  
  return symbols[currency.toUpperCase()] || currency.toUpperCase();
};

export const validateCurrency = (currency: string): boolean => {
  const validCurrencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD',
    'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR', 'KRW',
    'PLN', 'CZK', 'HUF', 'ILS', 'CLP', 'PHP', 'AED', 'COP', 'SAR', 'MYR',
    'RON', 'THB', 'BGN', 'HRK', 'IDR', 'ISK', 'UAH'
  ];
  
  return validCurrencies.includes(currency.toUpperCase());
};

export const parseAmount = (value: string | number): number => {
  if (typeof value === 'number') return value;
  
  // Remove currency symbols and formatting
  const cleaned = value.replace(/[$€£¥₹₽₺₪₩₵₡₦₨₪₫₡₵₦₨₪₫₡]/g, '')
                      .replace(/[,\s]/g, '');
  
  return parseFloat(cleaned) || 0;
};