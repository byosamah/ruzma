
import { CurrencyCode } from '@/lib/currency';

// Base prices in USD
export const BASE_PRICES = {
  free: 0,
  plus: 19,
  pro: 349,
};

// Currency exchange rates (USD as base)
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  SAR: 3.75,
  JOD: 0.71,
  AED: 3.67,
  GBP: 0.79,
  EGP: 48.5,
};
