import { securityMonitor } from '../security/monitoring';

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  // Sanitize input
  const sanitizedEmail = email.trim().toLowerCase();
  
  // Check if sanitization changed the input (potential security issue)
  if (sanitizedEmail !== email) {
    securityMonitor.logEvent('input_sanitization', {
      type: 'email',
      original: email,
      sanitized: sanitizedEmail
    });
  }

  // Enhanced email regex that covers most valid email formats
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(sanitizedEmail)) {
    securityMonitor.monitorValidationFailure(email, 'email_format', {
      reason: 'Invalid email format'
    });
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Check length constraints
  if (sanitizedEmail.length > 254) {
    securityMonitor.monitorValidationFailure(email, 'email_length', {
      length: sanitizedEmail.length,
      maxAllowed: 254
    });
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true };
};