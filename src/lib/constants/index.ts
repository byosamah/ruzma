/**
 * Application-wide constants
 */

// Application info
export const APP_NAME = 'Ruzma';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Comprehensive freelancer management platform';

// API configuration
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_COUNT = 3;
export const API_RETRY_DELAY = 1000; // 1 second

// Authentication
export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Storage keys
export const STORAGE_KEYS = {
  USER: 'ruzma_user',
  PROFILE: 'ruzma_profile',
  LANGUAGE: 'ruzma_language',
  THEME: 'ruzma_theme',
  PREFERENCES: 'ruzma_preferences',
  RECENT_PROJECTS: 'ruzma_recent_projects',
  DRAFT_PROJECT: 'ruzma_draft_project',
  DRAFT_INVOICE: 'ruzma_draft_invoice',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

// File upload
export const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
} as const;

export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  VIDEO: ['video/mp4', 'video/webm'],
} as const;

// Status values
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
} as const;

export const MILESTONE_STATUS = {
  PENDING: 'pending',
  PAYMENT_SUBMITTED: 'payment_submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export const CONTRACT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// User types
export const USER_TYPES = {
  FREE: 'free',
  PLUS: 'plus',
  PRO: 'pro',
} as const;

// Plan limits
export const PLAN_LIMITS = {
  [USER_TYPES.FREE]: {
    projects: 1,
    storage: 500 * 1024 * 1024, // 500MB
    clients: 5,
    invoices: 10,
  },
  [USER_TYPES.PLUS]: {
    projects: 999999, // Unlimited
    storage: 10 * 1024 * 1024 * 1024, // 10GB
    clients: 999999, // Unlimited
    invoices: 999999, // Unlimited
  },
  [USER_TYPES.PRO]: {
    projects: 999999, // Unlimited
    storage: 50 * 1024 * 1024 * 1024, // 50GB
    clients: 999999, // Unlimited
    invoices: 999999, // Unlimited
  },
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  PAYMENT_PROOF: 'payment_proof',
  DEADLINE_WARNING: 'deadline_warning',
  PROJECT_LIMIT: 'project_limit',
  STORAGE_LIMIT: 'storage_limit',
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'PPP', // Aug 29, 2023
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'PPpp', // Aug 29, 2023 at 2:30 PM
  TIME: 'p', // 2:30 PM
  RELATIVE: 'relative', // 2 days ago
} as const;

// Currency formats
export const DEFAULT_CURRENCY = 'USD';
export const CURRENCY_DISPLAY = 'symbol'; // $100 vs USD 100

// Language settings
export const LANGUAGES = {
  EN: 'en',
  AR: 'ar',
} as const;

export const DEFAULT_LANGUAGE = LANGUAGES.EN;

// Theme settings
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const DEFAULT_THEME = THEMES.LIGHT;

// Animation durations (ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    GET: '/projects/:id',
    UPDATE: '/projects/:id',
    DELETE: '/projects/:id',
  },
  CLIENTS: {
    LIST: '/clients',
    CREATE: '/clients',
    GET: '/clients/:id',
    UPDATE: '/clients/:id',
    DELETE: '/clients/:id',
  },
  INVOICES: {
    LIST: '/invoices',
    CREATE: '/invoices',
    GET: '/invoices/:id',
    UPDATE: '/invoices/:id',
    DELETE: '/invoices/:id',
  },
  MILESTONES: {
    LIST: '/milestones',
    CREATE: '/milestones',
    GET: '/milestones/:id',
    UPDATE: '/milestones/:id',
    DELETE: '/milestones/:id',
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  CREATED: 'Created successfully.',
  UPDATED: 'Updated successfully.',
  DELETED: 'Deleted successfully.',
  COPIED: 'Copied to clipboard.',
} as const;

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 500,
  EMAIL_REGEX: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  URL_REGEX: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;

// Feature flags
export const FEATURES = {
  DARK_MODE: false,
  TEAM_COLLABORATION: false,
  ADVANCED_ANALYTICS: true,
  AI_INSIGHTS: false,
  MOBILE_APP: false,
} as const;