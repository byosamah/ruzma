/**
 * Simple currency utilities
 */

export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const getCurrencySymbol = (currency: string, locale: string = 'en-US'): string => {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    });
    return formatter.formatToParts(0).find(part => part.type === 'currency')?.value || currency;
  } catch (error) {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
    };
    return symbols[currency] || currency;
  }
};

export const CURRENCIES = [
  { code: 'USD' as const, name: 'US Dollar', symbol: '$' },
  { code: 'EUR' as const, name: 'Euro', symbol: '€' },
  { code: 'GBP' as const, name: 'British Pound', symbol: '£' },
  { code: 'JPY' as const, name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD' as const, name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD' as const, name: 'Australian Dollar', symbol: 'A$' },
  { code: 'SAR' as const, name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'AED' as const, name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'JOD' as const, name: 'Jordanian Dinar', symbol: 'JD' },
  { code: 'EGP' as const, name: 'Egyptian Pound', symbol: 'E£' },
] as const;

export const getAllCurrencies = () => CURRENCIES;

export const getPopularCurrencies = () => CURRENCIES.slice(0, 6);

export const searchCurrencies = (query: string) => 
  CURRENCIES.filter(currency => 
    currency.code.toLowerCase().includes(query.toLowerCase()) ||
    currency.name.toLowerCase().includes(query.toLowerCase())
  );

export const getPossibleCountriesByCurrency = (currency: string) => {
  const currencyToCountries: Record<string, string[]> = {
    USD: ['US', 'United States'],
    EUR: ['DE', 'FR', 'IT', 'ES', 'Germany', 'France', 'Italy', 'Spain'],
    GBP: ['GB', 'United Kingdom'],
    JPY: ['JP', 'Japan'],
    CAD: ['CA', 'Canada'],
    AUD: ['AU', 'Australia'],
    SAR: ['SA', 'Saudi Arabia'],
  };
  return currencyToCountries[currency] || [];
};

export type CurrencyCode = typeof CURRENCIES[number]['code'];
export type Currency = typeof CURRENCIES[number];