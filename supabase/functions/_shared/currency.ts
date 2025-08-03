// Shared currency utilities for edge functions
export interface CurrencyConfig {
  symbol: string;
  name: string;
  decimals: number;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { symbol: '£', name: 'British Pound', decimals: 2 },
  JPY: { symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
  SEK: { symbol: 'kr', name: 'Swedish Krona', decimals: 2 },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2 },
  MXN: { symbol: '$', name: 'Mexican Peso', decimals: 2 },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2 },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', decimals: 2 },
  TRY: { symbol: '₺', name: 'Turkish Lira', decimals: 2 },
  RUB: { symbol: '₽', name: 'Russian Ruble', decimals: 2 },
  INR: { symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  BRL: { symbol: 'R$', name: 'Brazilian Real', decimals: 2 },
  ZAR: { symbol: 'R', name: 'South African Rand', decimals: 2 },
  KRW: { symbol: '₩', name: 'South Korean Won', decimals: 0 },
  PLN: { symbol: 'zł', name: 'Polish Zloty', decimals: 2 },
  THB: { symbol: '฿', name: 'Thai Baht', decimals: 2 },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0 },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', decimals: 0 },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', decimals: 2 },
  ILS: { symbol: '₪', name: 'Israeli Shekel', decimals: 2 },
  CLP: { symbol: '$', name: 'Chilean Peso', decimals: 0 },
  PHP: { symbol: '₱', name: 'Philippine Peso', decimals: 2 },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', decimals: 2 },
  COP: { symbol: '$', name: 'Colombian Peso', decimals: 0 },
  SAR: { symbol: 'ر.س', name: 'Saudi Riyal', decimals: 2 },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2 },
  RON: { symbol: 'lei', name: 'Romanian Leu', decimals: 2 },
};

export const formatCurrency = (
  amount: number, 
  currency: string = 'USD', 
  language: 'en' | 'ar' = 'en'
): string => {
  const currencyConfig = CURRENCIES[currency];
  if (!currencyConfig) {
    return `${currency} ${amount.toLocaleString()}`;
  }

  const { symbol, decimals } = currencyConfig;
  const formattedAmount = amount.toLocaleString(language === 'ar' ? 'ar' : 'en', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // For Arabic currency symbols, use Arabic versions when available
  const displaySymbol = language === 'ar' && (currency === 'AED' || currency === 'SAR') 
    ? symbol 
    : currency === 'AED' ? 'AED' : currency === 'SAR' ? 'SAR' : symbol;

  return language === 'ar' 
    ? `${displaySymbol} ${formattedAmount}` 
    : `${displaySymbol}${formattedAmount}`;
};

export const getCurrencySymbol = (currency: string = 'USD', language: 'en' | 'ar' = 'en'): string => {
  const currencyConfig = CURRENCIES[currency];
  if (!currencyConfig) return currency;

  if (language === 'ar' && (currency === 'AED' || currency === 'SAR')) {
    return currencyConfig.symbol;
  }
  
  return currency === 'AED' ? 'AED' : currency === 'SAR' ? 'SAR' : currencyConfig.symbol;
};