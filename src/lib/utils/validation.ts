import { z } from 'zod';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Basic types
  email: z.string().email('Invalid email address'),
  uuid: z.string().uuid('Invalid ID format'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  url: z.string().url('Invalid URL'),
  
  // Numbers
  positiveNumber: z.number().positive('Must be a positive number'),
  percentage: z.number().min(0).max(100),
  price: z.number().positive().multipleOf(0.01),
  
  // Dates
  dateString: z.string().datetime(),
  futureDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Date must be in the future',
  }),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).refine((data) => new Date(data.start) <= new Date(data.end), {
    message: 'End date must be after start date',
  }),
  
  // Currency
  currency: z.enum([
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD',
    'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR',
    'AED', 'SAR', 'PLN', 'THB', 'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP',
    'EGP', 'KRW', 'MYR', 'COP', 'PKR', 'DZD', 'MAD', 'VND', 'BGN', 'DKK',
    'TWD', 'ARS', 'RON', 'VES', 'IQD', 'KWD', 'NGN', 'UAH', 'QAR', 'PEN',
    'JOD', 'LKR', 'OMR', 'UYU', 'GEL', 'TND', 'BDT', 'LBP', 'VEB', 'RSD',
    'KZT', 'ISK', 'DOP', 'GTQ', 'NPR', 'KES', 'AZN', 'UZS', 'BYN', 'MKD',
    'HRK', 'BOB', 'EEK'
  ]),
  
  // User types
  userType: z.enum(['free', 'plus', 'pro']),
  
  // Status enums
  projectStatus: z.enum(['active', 'completed', 'on_hold', 'cancelled']),
  milestoneStatus: z.enum(['pending', 'payment_submitted', 'approved', 'rejected']),
  invoiceStatus: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  contractStatus: z.enum(['pending', 'approved', 'rejected']),
  
  // File validation
  file: z.object({
    name: z.string(),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
    type: z.string(),
  }),
  
  // Common fields
  requiredString: z.string().min(1, 'This field is required'),
  optionalString: z.string().optional().nullable(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
};

/**
 * Form validation helper
 */
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { isValid: boolean; errors?: Record<string, string>; data?: T } => {
  try {
    const validData = schema.parse(data);
    return { isValid: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {} as Record<string, string>);
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { _error: 'Validation failed' } };
  }
};

/**
 * Create form schema with common fields
 */
export const createFormSchema = <T extends Record<string, any>>(
  fields: T
): z.ZodObject<T> => {
  return z.object(fields);
};

/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  return commonSchemas.email.safeParse(email).success;
};

/**
 * URL validation
 */
export const isValidUrl = (url: string): boolean => {
  return commonSchemas.url.safeParse(url).success;
};

/**
 * Phone number validation (international)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Password strength validation
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate file type
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.some(type => {
    if (type.includes('*')) {
      const [category] = type.split('/');
      return file.type.startsWith(category);
    }
    return file.type === type || fileExtension === type;
  });
};