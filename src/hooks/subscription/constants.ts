
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
  KWD: 0.31,
  QAR: 3.64,
  BHD: 0.38,
  OMR: 0.38,
  LBP: 89500,
  MAD: 9.8,
  TND: 3.1,
  DZD: 134,
  CAD: 1.35,
  AUD: 1.52,
  CHF: 0.88,
  JPY: 148,
};
