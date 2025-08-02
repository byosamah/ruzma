
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
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.67,
  JOD: 0.71,
  EGP: 48.5,
  CAD: 1.35,
  AUD: 1.52,
  JPY: 148,
};
