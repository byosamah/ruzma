import { toast } from 'sonner';
import { logSecurityEvent } from '@/lib/utils/securityLogger';

export interface ErrorContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class ErrorHandler {
  private static readonly errorMessages: Record<string, string> = {
    // Auth errors
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please verify your email before logging in',
    'User already registered': 'An account with this email already exists',
    
    // Permission errors
    'new row violates row-level security policy': 'You do not have permission to perform this action',
    'permission denied': 'Access denied',
    
    // Network errors
    'Failed to fetch': 'Network error. Please check your connection',
    'NetworkError': 'Unable to connect. Please try again',
    
    // Storage errors
    'Storage limit exceeded': 'Storage limit exceeded. Please upgrade your plan',
    'Invalid file type': 'This file type is not supported',
    'File too large': 'File size exceeds the maximum allowed',
    
    // General database errors
    'duplicate key value': 'This item already exists',
    'foreign key violation': 'Cannot delete this item as it is referenced by other data',
    'check constraint': 'Invalid data provided',
    
    // Default
    'default': 'An unexpected error occurred. Please try again'
  };

  static handle(
    error: any,
    context: string,
    options: {
      showToast?: boolean;
      logEvent?: boolean;
      throwError?: boolean;
      customMessage?: string;
    } = {}
  ): void {
    const {
      showToast = true,
      logEvent = true,
      throwError = false,
      customMessage
    } = options;

    // Log to console
    console.error(`[${context}]:`, error);

    // Get user-friendly message
    const userMessage = customMessage || this.getUserMessage(error);

    // Show toast notification
    if (showToast) {
      toast.error(userMessage);
    }

    // Log security event
    if (logEvent) {
      logSecurityEvent('error_occurred', {
        context,
        error: this.getErrorDetails(error),
        message: userMessage
      });
    }

    // Re-throw if requested
    if (throwError) {
      throw error;
    }
  }

  static getUserMessage(error: any): string {
    if (!error) {
      return this.errorMessages.default;
    }

    // Check error message
    const errorMessage = error?.message || error?.error || '';
    
    // Find matching error message
    for (const [key, value] of Object.entries(this.errorMessages)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Check specific error codes
    if (error?.code) {
      switch (error.code) {
        case '23505':
          return this.errorMessages['duplicate key value'];
        case '23503':
          return this.errorMessages['foreign key violation'];
        case '23514':
          return this.errorMessages['check constraint'];
        case '42501':
          return this.errorMessages['permission denied'];
      }
    }

    // Return default message
    return this.errorMessages.default;
  }

  private static getErrorDetails(error: any): Record<string, any> {
    if (!error) {
      return { type: 'unknown', message: 'No error provided' };
    }

    return {
      type: error.constructor?.name || 'unknown',
      message: error.message || error.error || String(error),
      code: error.code,
      statusCode: error.statusCode || error.status,
      stack: error.stack
    };
  }

  static async handleAsync<T>(
    promise: Promise<T>,
    context: string,
    options?: Parameters<typeof ErrorHandler.handle>[2]
  ): Promise<T | null> {
    try {
      return await promise;
    } catch (error) {
      this.handle(error, context, options);
      return null;
    }
  }

  static createContextualHandler(defaultContext: string) {
    return {
      handle: (error: any, specificContext?: string, options?: Parameters<typeof ErrorHandler.handle>[2]) => {
        this.handle(error, specificContext || defaultContext, options);
      },
      handleAsync: <T>(
        promise: Promise<T>,
        specificContext?: string,
        options?: Parameters<typeof ErrorHandler.handle>[2]
      ) => {
        return this.handleAsync(promise, specificContext || defaultContext, options);
      }
    };
  }
}