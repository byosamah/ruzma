
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

// Grace period constants (in days)
export const GRACE_PERIODS = {
  TRIAL_GRACE_DAYS: 3,        // Grace period after trial expires
  PAYMENT_GRACE_DAYS: 7,      // Grace period after payment failure
  REMINDER_DAYS: [3, 6],      // Send reminders on these days during grace period
} as const;

// Subscription status definitions
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  ON_TRIAL: 'on_trial',
  UNPAID: 'unpaid',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PAUSED: 'paused',
} as const;

// Plan definitions with trial days and payment types
export const PLAN_CONFIG = {
  free: {
    trial_days: 0,
    max_projects: 1,
    max_clients: 5,
    payment_type: 'free',
    ai_features: false,
  },
  plus: {
    trial_days: 7,
    max_projects: 50,
    max_clients: 100,
    payment_type: 'recurring',
    ai_features: true,  // AI features enabled for Plus
  },
  pro: {
    trial_days: 0,      // No trial for lifetime plan
    max_projects: -1,   // Unlimited
    max_clients: -1,    // Unlimited  
    payment_type: 'lifetime',
    ai_features: false, // AI features disabled for lifetime plan
  },
} as const;
