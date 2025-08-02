/**
 * Currency formatting utilities
 */

import { formatAmountWithSymbol, getCurrencySymbol, getCurrencyDecimals } from '@/lib/utils/currency';

/**
 * Format currency amount
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  options?: {
    includeCode?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  const { includeCode = false } = options || {};
  return formatAmountWithSymbol(amount, currency, includeCode);
};

/**
 * Format currency amount with locale support
 */
export const formatCurrencyLocale = (
  amount: number,
  locale: string = 'en-US',
  currency: string = 'USD'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: getCurrencyDecimals(currency),
      maximumFractionDigits: getCurrencyDecimals(currency)
    }).format(amount);
  } catch (error) {
    // Fallback to custom formatting
    return formatAmountWithSymbol(amount, currency);
  }
};

/**
 * Format currency amount for display
 */
export const displayCurrency = (
  amount: number | null | undefined,
  currency: string = 'USD'
): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${getCurrencySymbol(currency)}0.00`;
  }
  return formatAmountWithSymbol(amount, currency);
};