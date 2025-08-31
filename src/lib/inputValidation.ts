
import { logSecurityEvent } from './authSecurity';

// Comprehensive input sanitization utilities
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potential XSS vectors
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:text\/html/gi, '') // Remove data URLs
    .trim();
};

// Enhanced HTML sanitization for rich text content
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  // Basic HTML sanitization - remove dangerous tags and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/<link\b[^<]*>/gi, '')
    .replace(/<meta\b[^<]*>/gi, '')
    .replace(/on\w+\s*=[^>]*/gi, '') // Remove all event handlers
    .replace(/javascript:[^"']*/gi, '') // Remove javascript: URLs
    .replace(/data:(?!image\/)[^"']*/gi, '') // Allow only image data URLs
    .trim();
};

// Validate email format with additional security checks
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const sanitizedEmail = sanitizeInput(email);
  
  // Check for potential injection attempts
  if (sanitizedEmail !== email) {
    logSecurityEvent('email_validation_sanitized', { 
      original: email.substring(0, 20) + '...',
      sanitized: sanitizedEmail.substring(0, 20) + '...'
    });
  }

  // Enhanced email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(sanitizedEmail)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Additional security checks
  if (sanitizedEmail.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  return { isValid: true };
};

// Validate project names with security considerations
export const validateProjectName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Project name is required' };
  }

  const sanitizedName = sanitizeInput(name);
  
  if (sanitizedName !== name) {
    logSecurityEvent('project_name_sanitized', { 
      original: name.substring(0, 50),
      sanitized: sanitizedName.substring(0, 50)
    });
  }

  if (sanitizedName.length < 2) {
    return { isValid: false, error: 'Project name must be at least 2 characters' };
  }

  if (sanitizedName.length > 100) {
    return { isValid: false, error: 'Project name is too long (max 100 characters)' };
  }

  return { isValid: true };
};

// Validate monetary amounts with precision checks
export const validateAmount = (amount: number | string): { isValid: boolean; error?: string } => {
  if (amount === null || amount === undefined || amount === '') {
    return { isValid: false, error: 'Amount is required' };
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Invalid amount format' };
  }

  if (numAmount < 0) {
    return { isValid: false, error: 'Amount cannot be negative' };
  }

  if (numAmount > 999999999.99) {
    return { isValid: false, error: 'Amount is too large' };
  }

  // Check for reasonable decimal precision (max 2 decimal places for currency)
  const decimalPlaces = (numAmount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { isValid: false, error: 'Amount cannot have more than 2 decimal places' };
  }

  return { isValid: true };
};

// Validate file uploads with comprehensive security checks
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // File size validation (5MB limit)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    logSecurityEvent('file_upload_size_violation', { 
      fileName: file.name,
      size: file.size,
      maxSize: MAX_FILE_SIZE
    });
    return { isValid: false, error: 'File size exceeds 5MB limit' };
  }

  // File type validation
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf'
  ];

  if (!ALLOWED_TYPES.includes(file.type)) {
    logSecurityEvent('file_upload_type_violation', { 
      fileName: file.name,
      fileType: file.type,
      allowedTypes: ALLOWED_TYPES
    });
    return { isValid: false, error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` };
  }

  // Filename validation
  const sanitizedName = sanitizeFilename(file.name);
  if (sanitizedName !== file.name) {
    logSecurityEvent('file_upload_name_sanitized', { 
      original: file.name,
      sanitized: sanitizedName
    });
  }

  // Check for suspicious file extensions in the name
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.js', '.vbs', '.jar'];
  const lowerName = file.name.toLowerCase();
  for (const ext of suspiciousExtensions) {
    if (lowerName.includes(ext)) {
      logSecurityEvent('file_upload_suspicious_extension', { 
        fileName: file.name,
        suspiciousExtension: ext
      });
      return { isValid: false, error: 'File contains suspicious content' };
    }
  }

  return { isValid: true };
};

// Secure filename sanitization
export const sanitizeFilename = (filename: string): string => {
  if (!filename || typeof filename !== 'string') return 'file';
  
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^[._]+|[._]+$/g, '') // Remove leading/trailing dots and underscores
    .substring(0, 100); // Limit length
};

// Validate JSON data with size and structure limits
export const validateJSONData = (data: unknown): { isValid: boolean; error?: string } => {
  try {
    const jsonString = JSON.stringify(data);
    
    // Size limit (1MB for JSON data)
    if (jsonString.length > 1024 * 1024) {
      return { isValid: false, error: 'Data is too large' };
    }

    // Check for potential security issues in JSON
    if (jsonString.includes('<script') || jsonString.includes('javascript:')) {
      logSecurityEvent('json_validation_security_violation', { 
        dataPreview: jsonString.substring(0, 100)
      });
      return { isValid: false, error: 'Data contains potentially unsafe content' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid data format' };
  }
};
