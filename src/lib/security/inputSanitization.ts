
import { logSecurityEvent } from '../authSecurity';

// Enhanced input sanitization with comprehensive security checks
export const sanitizeInput = (input: string, options: {
  allowHtml?: boolean;
  maxLength?: number;
  type?: 'text' | 'email' | 'url' | 'phone';
} = {}): string => {
  if (!input || typeof input !== 'string') return '';
  
  const { allowHtml = false, maxLength = 1000, type = 'text' } = options;
  
  // Length validation
  if (input.length > maxLength) {
    logSecurityEvent('input_length_violation', {
      inputLength: input.length,
      maxLength,
      type
    });
    return input.substring(0, maxLength);
  }
  
  let sanitized = input.trim();
  
  if (!allowHtml) {
    // Remove all HTML tags and potentially dangerous content
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*>/gi, '')
      .replace(/<link\b[^<]*>/gi, '')
      .replace(/<meta\b[^<]*>/gi, '')
      .replace(/on\w+\s*=[^>]*/gi, '')
      .replace(/javascript:[^"']*/gi, '')
      .replace(/data:(?!image\/)[^"']*/gi, '');
  }
  
  // Type-specific validation
  switch (type) {
    case 'email':
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(sanitized)) {
        logSecurityEvent('invalid_email_format', { input: sanitized.substring(0, 50) });
      }
      break;
    case 'url':
      try {
        new URL(sanitized);
      } catch {
        logSecurityEvent('invalid_url_format', { input: sanitized.substring(0, 50) });
      }
      break;
  }
  
  return sanitized;
};

// Enhanced file validation with content analysis
export const validateFileSecure = (file: File): { isValid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.js', '.vbs', '.jar', '.php'];
  
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }
  
  // Size validation
  if (file.size > MAX_FILE_SIZE) {
    logSecurityEvent('file_size_violation', { 
      fileName: file.name,
      size: file.size,
      maxSize: MAX_FILE_SIZE
    });
    return { isValid: false, error: 'File size exceeds 5MB limit' };
  }
  
  // MIME type validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    logSecurityEvent('file_type_violation', { 
      fileName: file.name,
      fileType: file.type
    });
    return { isValid: false, error: 'Invalid file type' };
  }
  
  // Dangerous extension check
  const fileName = file.name.toLowerCase();
  for (const ext of DANGEROUS_EXTENSIONS) {
    if (fileName.includes(ext)) {
      logSecurityEvent('dangerous_file_extension', { 
        fileName: file.name,
        extension: ext
      });
      return { isValid: false, error: 'File contains dangerous content' };
    }
  }
  
  // Filename sanitization
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 255);
    
  if (sanitizedName !== file.name) {
    logSecurityEvent('filename_sanitized', { 
      original: file.name,
      sanitized: sanitizedName
    });
  }
  
  return { isValid: true };
};

// Rate limiting for form submissions
class RateLimiter {
  private attempts = new Map<string, number[]>();
  
  checkLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts
    const validAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      logSecurityEvent('rate_limit_exceeded', {
        identifier: identifier.substring(0, 10) + '...',
        attempts: validAttempts.length,
        maxAttempts
      });
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    return true;
  }
  
  cleanup() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [identifier, attempts] of this.attempts.entries()) {
      const validAttempts = attempts.filter(time => now - time < oneHour);
      if (validAttempts.length === 0) {
        this.attempts.delete(identifier);
      } else {
        this.attempts.set(identifier, validAttempts);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Auto cleanup every 30 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 30 * 60 * 1000);
