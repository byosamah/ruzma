/**
 * Application Configuration Constants
 * Centralized configuration to avoid hardcoded URLs throughout the app
 */

// App URLs
export const APP_CONFIG = {
  BASE_URL: import.meta.env.VITE_APP_BASE_URL || 'https://app.ruzma.co',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://***REMOVED***.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

// External API URLs
export const API_URLS = {
  LEMON_SQUEEZY: 'https://api.lemonsqueezy.com/v1',
  RESEND: 'https://api.resend.com',
  GOOGLE_FONTS: 'https://fonts.googleapis.com',
} as const;

// Route generators for consistent URL building
export const ROUTES = {
  CLIENT_PROJECT: (token: string) => `${APP_CONFIG.BASE_URL}/client/project/${token}`,
  CONTRACT_APPROVAL: (token: string) => `${APP_CONFIG.BASE_URL}/contract/approve/${token}`,
  RESET_PASSWORD: (lang = 'en') => `${APP_CONFIG.BASE_URL}/${lang}/reset-password`,
} as const;

// Default placeholder URLs for forms/examples
export const PLACEHOLDERS = {
  WEBSITE_URL: 'https://yourwebsite.com',
  EXAMPLE_URL: 'example.com or https://example.com',
} as const;