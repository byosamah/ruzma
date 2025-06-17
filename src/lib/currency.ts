
export const CURRENCIES = {
  SAR: { symbol: 'ر.س', name: 'Saudi Riyal' },
  JOD: { symbol: 'د.ا', name: 'Jordanian Dinar' },
  USD: { symbol: '$', name: 'US Dollar' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' },
  GBP: { symbol: '£', name: 'British Pound' },
  EGP: { symbol: 'ج.م', name: 'Egyptian Pound' }
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const formatCurrency = (amount: number, currency: CurrencyCode = 'USD'): string => {
  // Add safety check for undefined currency
  if (!currency || !CURRENCIES[currency]) {
    console.warn('Invalid currency code:', currency, 'defaulting to USD');
    currency = 'USD';
  }
  
  const { symbol } = CURRENCIES[currency];
  return `${symbol}${amount.toLocaleString()}`;
};

export const getCurrencySymbol = (currency: CurrencyCode = 'USD'): string => {
  if (!currency || !CURRENCIES[currency]) {
    console.warn('Invalid currency code:', currency, 'defaulting to USD');
    currency = 'USD';
  }
  return CURRENCIES[currency].symbol;
};
