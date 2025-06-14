
export const currencySymbols = {
  SAR: 'ر.س',
  USD: '$',
  JOD: 'د.ا',
  AED: 'د.إ',
  EGP: 'ج.م'
} as const;

export type CurrencyCode = keyof typeof currencySymbols;

export const getCurrencySymbol = (currency: string): string => {
  return currencySymbols[currency as CurrencyCode] || '$';
};

export const formatCurrency = (amount: number, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString()}`;
};
