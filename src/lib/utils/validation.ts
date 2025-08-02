import { z } from 'zod';

// Common validation patterns
export const validationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d{1,2})?$/,
  filename: /^[a-zA-Z0-9-_. ]+$/,
};

// Common validation schemas
export const commonSchemas = {
  email: z.string().email('Invalid email address'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  phone: z.string().regex(validationPatterns.phone, 'Invalid phone number'),
  
  url: z.string().url('Invalid URL'),
  
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date',
  }),
  
  positiveNumber: z.number().positive('Must be a positive number'),
  
  nonEmptyString: z.string().min(1, 'This field is required'),
  
  currency: z.number()
    .positive('Amount must be greater than 0')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
};

// Validation functions
export const validators = {
  isEmail: (email: string): boolean => {
    return validationPatterns.email.test(email);
  },

  isValidPassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
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
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  isUrl: (url: string): boolean => {
    return validationPatterns.url.test(url);
  },

  isPhone: (phone: string): boolean => {
    return validationPatterns.phone.test(phone);
  },

  isFilename: (filename: string): boolean => {
    return validationPatterns.filename.test(filename);
  },

  sanitizeEmail: (email: string): string => {
    return email.toLowerCase().trim();
  },

  sanitizeFilename: (filename: string): string => {
    return filename.replace(/[^a-zA-Z0-9-_. ]/g, '_');
  },

  sanitizeHtml: (html: string): string => {
    // Basic HTML sanitization - consider using DOMPurify for production
    return html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  isWithinRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  isValidDate: (date: string | Date): boolean => {
    const d = date instanceof Date ? date : new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  },

  isFutureDate: (date: string | Date): boolean => {
    const d = date instanceof Date ? date : new Date(date);
    return validators.isValidDate(d) && d > new Date();
  },

  isPastDate: (date: string | Date): boolean => {
    const d = date instanceof Date ? date : new Date(date);
    return validators.isValidDate(d) && d < new Date();
  },
};

// Form validation helpers
export const formValidation = {
  required: (message = 'This field is required') => ({
    required: true,
    message,
  }),

  minLength: (length: number, message?: string) => ({
    minLength: {
      value: length,
      message: message || `Must be at least ${length} characters`,
    },
  }),

  maxLength: (length: number, message?: string) => ({
    maxLength: {
      value: length,
      message: message || `Must be no more than ${length} characters`,
    },
  }),

  pattern: (pattern: RegExp, message: string) => ({
    pattern: {
      value: pattern,
      message,
    },
  }),

  validate: (fn: (value: any) => boolean | string) => ({
    validate: fn,
  }),
};

// Composite validators for common use cases
export const compositeValidators = {
  userRegistration: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: z.string(),
    fullName: commonSchemas.nonEmptyString,
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),

  projectForm: z.object({
    name: commonSchemas.nonEmptyString.max(100, 'Name is too long'),
    description: z.string().optional(),
    budget: commonSchemas.currency.optional(),
    deadline: z.string().refine((val) => !val || validators.isFutureDate(val), {
      message: 'Deadline must be in the future',
    }).optional(),
    clientEmail: commonSchemas.email.optional(),
  }),

  invoiceForm: z.object({
    clientName: commonSchemas.nonEmptyString,
    clientEmail: commonSchemas.email,
    amount: commonSchemas.currency,
    dueDate: z.string().refine(validators.isFutureDate, {
      message: 'Due date must be in the future',
    }),
    items: z.array(z.object({
      description: commonSchemas.nonEmptyString,
      quantity: commonSchemas.positiveNumber,
      rate: commonSchemas.currency,
    })).min(1, 'At least one item is required'),
  }),
};

// Utility function to get validation errors from Zod
export function getValidationErrors<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Record<string, string> | null {
  try {
    schema.parse(data);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return errors;
    }
    return { _error: 'Validation failed' };
  }
}

// Export everything as a single object for convenience
export const validation = {
  patterns: validationPatterns,
  schemas: commonSchemas,
  validators,
  form: formValidation,
  composite: compositeValidators,
  getErrors: getValidationErrors,
};