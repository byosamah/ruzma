/**
 * Currency utilities and conversion helpers
 */

// Currency data with symbols and decimal places
export const currencyData: Record<string, { symbol: string; decimals: number; name: string }> = {
  USD: { symbol: '$', decimals: 2, name: 'US Dollar' },
  EUR: { symbol: '€', decimals: 2, name: 'Euro' },
  GBP: { symbol: '£', decimals: 2, name: 'British Pound' },
  JPY: { symbol: '¥', decimals: 0, name: 'Japanese Yen' },
  AUD: { symbol: 'A$', decimals: 2, name: 'Australian Dollar' },
  CAD: { symbol: 'C$', decimals: 2, name: 'Canadian Dollar' },
  CHF: { symbol: 'Fr', decimals: 2, name: 'Swiss Franc' },
  CNY: { symbol: '¥', decimals: 2, name: 'Chinese Yuan' },
  SEK: { symbol: 'kr', decimals: 2, name: 'Swedish Krona' },
  NZD: { symbol: 'NZ$', decimals: 2, name: 'New Zealand Dollar' },
  MXN: { symbol: '$', decimals: 2, name: 'Mexican Peso' },
  SGD: { symbol: 'S$', decimals: 2, name: 'Singapore Dollar' },
  HKD: { symbol: 'HK$', decimals: 2, name: 'Hong Kong Dollar' },
  NOK: { symbol: 'kr', decimals: 2, name: 'Norwegian Krone' },
  KRW: { symbol: '₩', decimals: 0, name: 'South Korean Won' },
  TRY: { symbol: '₺', decimals: 2, name: 'Turkish Lira' },
  RUB: { symbol: '₽', decimals: 2, name: 'Russian Ruble' },
  INR: { symbol: '₹', decimals: 2, name: 'Indian Rupee' },
  BRL: { symbol: 'R$', decimals: 2, name: 'Brazilian Real' },
  ZAR: { symbol: 'R', decimals: 2, name: 'South African Rand' },
  AED: { symbol: 'د.إ', decimals: 2, name: 'UAE Dirham' },
  SAR: { symbol: 'ر.س', decimals: 2, name: 'Saudi Riyal' },
  PLN: { symbol: 'zł', decimals: 2, name: 'Polish Złoty' },
  THB: { symbol: '฿', decimals: 2, name: 'Thai Baht' },
  IDR: { symbol: 'Rp', decimals: 0, name: 'Indonesian Rupiah' },
  HUF: { symbol: 'Ft', decimals: 0, name: 'Hungarian Forint' },
  CZK: { symbol: 'Kč', decimals: 2, name: 'Czech Koruna' },
  ILS: { symbol: '₪', decimals: 2, name: 'Israeli Shekel' },
  CLP: { symbol: '$', decimals: 0, name: 'Chilean Peso' },
  PHP: { symbol: '₱', decimals: 2, name: 'Philippine Peso' },
  EGP: { symbol: 'E£', decimals: 2, name: 'Egyptian Pound' },
  MYR: { symbol: 'RM', decimals: 2, name: 'Malaysian Ringgit' },
  COP: { symbol: '$', decimals: 0, name: 'Colombian Peso' },
  PKR: { symbol: '₨', decimals: 2, name: 'Pakistani Rupee' },
  DZD: { symbol: 'د.ج', decimals: 2, name: 'Algerian Dinar' },
  MAD: { symbol: 'د.م.', decimals: 2, name: 'Moroccan Dirham' },
  VND: { symbol: '₫', decimals: 0, name: 'Vietnamese Dong' },
  BGN: { symbol: 'лв', decimals: 2, name: 'Bulgarian Lev' },
  DKK: { symbol: 'kr', decimals: 2, name: 'Danish Krone' },
  TWD: { symbol: 'NT$', decimals: 2, name: 'Taiwan Dollar' },
  ARS: { symbol: '$', decimals: 2, name: 'Argentine Peso' },
  RON: { symbol: 'lei', decimals: 2, name: 'Romanian Leu' },
  VES: { symbol: 'Bs', decimals: 2, name: 'Venezuelan Bolívar' },
  IQD: { symbol: 'ع.د', decimals: 3, name: 'Iraqi Dinar' },
  KWD: { symbol: 'د.ك', decimals: 3, name: 'Kuwaiti Dinar' },
  NGN: { symbol: '₦', decimals: 2, name: 'Nigerian Naira' },
  UAH: { symbol: '₴', decimals: 2, name: 'Ukrainian Hryvnia' },
  QAR: { symbol: 'ر.ق', decimals: 2, name: 'Qatari Riyal' },
  PEN: { symbol: 'S/', decimals: 2, name: 'Peruvian Sol' },
  JOD: { symbol: 'د.أ', decimals: 3, name: 'Jordanian Dinar' },
  LKR: { symbol: 'Rs', decimals: 2, name: 'Sri Lankan Rupee' },
  OMR: { symbol: 'ر.ع.', decimals: 3, name: 'Omani Rial' },
  UYU: { symbol: '$U', decimals: 2, name: 'Uruguayan Peso' },
  GEL: { symbol: '₾', decimals: 2, name: 'Georgian Lari' },
  TND: { symbol: 'د.ت', decimals: 3, name: 'Tunisian Dinar' },
  BDT: { symbol: '৳', decimals: 2, name: 'Bangladeshi Taka' },
  LBP: { symbol: 'ل.ل', decimals: 2, name: 'Lebanese Pound' },
  VEB: { symbol: 'Bs', decimals: 2, name: 'Venezuelan Bolívar' },
  RSD: { symbol: 'дин.', decimals: 2, name: 'Serbian Dinar' },
  KZT: { symbol: '₸', decimals: 2, name: 'Kazakhstani Tenge' },
  ISK: { symbol: 'kr', decimals: 0, name: 'Icelandic Króna' },
  DOP: { symbol: 'RD$', decimals: 2, name: 'Dominican Peso' },
  GTQ: { symbol: 'Q', decimals: 2, name: 'Guatemalan Quetzal' },
  NPR: { symbol: '₨', decimals: 2, name: 'Nepalese Rupee' },
  KES: { symbol: 'KSh', decimals: 2, name: 'Kenyan Shilling' },
  AZN: { symbol: '₼', decimals: 2, name: 'Azerbaijani Manat' },
  UZS: { symbol: 'soʻm', decimals: 2, name: 'Uzbekistani Som' },
  BYN: { symbol: 'Br', decimals: 2, name: 'Belarusian Ruble' },
  MKD: { symbol: 'ден', decimals: 2, name: 'Macedonian Denar' },
  HRK: { symbol: 'kn', decimals: 2, name: 'Croatian Kuna' },
  BOB: { symbol: 'Bs', decimals: 2, name: 'Bolivian Boliviano' },
  EEK: { symbol: 'kr', decimals: 2, name: 'Estonian Kroon' }
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency: string): string => {
  return currencyData[currency]?.symbol || currency;
};

/**
 * Get currency name
 */
export const getCurrencyName = (currency: string): string => {
  return currencyData[currency]?.name || currency;
};

/**
 * Get currency decimal places
 */
export const getCurrencyDecimals = (currency: string): number => {
  return currencyData[currency]?.decimals ?? 2;
};

/**
 * Format amount with currency symbol
 */
export const formatAmountWithSymbol = (
  amount: number,
  currency: string,
  includeCode: boolean = false
): string => {
  const symbol = getCurrencySymbol(currency);
  const decimals = getCurrencyDecimals(currency);
  const formatted = amount.toFixed(decimals);
  
  // Place symbol based on currency convention
  const symbolAfter = ['kr', 'zł', 'Kč', 'Ft', 'лв', 'lei', 'дин.', 'ден', 'kn'];
  
  if (symbolAfter.includes(symbol)) {
    return includeCode ? `${formatted} ${symbol} ${currency}` : `${formatted} ${symbol}`;
  }
  
  return includeCode ? `${symbol}${formatted} ${currency}` : `${symbol}${formatted}`;
};

/**
 * Convert amount to smallest unit (e.g., dollars to cents)
 */
export const toSmallestUnit = (amount: number, currency: string): number => {
  const decimals = getCurrencyDecimals(currency);
  return Math.round(amount * Math.pow(10, decimals));
};

/**
 * Convert from smallest unit to main unit
 */
export const fromSmallestUnit = (amount: number, currency: string): number => {
  const decimals = getCurrencyDecimals(currency);
  return amount / Math.pow(10, decimals);
};

/**
 * Validate currency amount
 */
export const isValidAmount = (amount: number, currency: string): boolean => {
  if (isNaN(amount) || amount < 0) return false;
  
  const decimals = getCurrencyDecimals(currency);
  const multiplied = amount * Math.pow(10, decimals);
  
  // Check if the amount has more decimal places than allowed
  return multiplied === Math.floor(multiplied);
};

/**
 * Round amount to currency precision
 */
export const roundToCurrency = (amount: number, currency: string): number => {
  const decimals = getCurrencyDecimals(currency);
  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Get all supported currencies
 */
export const getAllCurrencies = (): Array<{ code: string; name: string; symbol: string }> => {
  return Object.entries(currencyData).map(([code, data]) => ({
    code,
    name: data.name,
    symbol: data.symbol
  }));
};

/**
 * Get popular currencies (for quick selection)
 */
export const getPopularCurrencies = (): string[] => {
  return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
};

/**
 * Parse currency amount from string
 */
export const parseCurrencyAmount = (
  value: string,
  currency?: string
): number | null => {
  // Remove currency symbols and spaces
  let cleaned = value.replace(/[^0-9.,\-]/g, '');
  
  // Handle different decimal separators
  if (currency && ['EUR', 'PLN', 'CZK', 'HUF'].includes(currency)) {
    // European format: 1.234,56
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // Standard format: 1,234.56
    cleaned = cleaned.replace(/,/g, '');
  }
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};