import { securityMonitor } from '../security/monitoring';
import { sanitizeInput } from './inputSanitization';

export const validateProjectName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Project name is required' };
  }

  // Sanitize the input
  const sanitizedName = sanitizeInput(name.trim());
  
  // Check if sanitization changed the input (potential security issue)
  if (sanitizedName !== name.trim()) {
    securityMonitor.logEvent('input_sanitization', {
      type: 'project_name',
      original: name,
      sanitized: sanitizedName
    });
  }

  // Check length constraints
  if (sanitizedName.length < 2) {
    return { isValid: false, error: 'Project name must be at least 2 characters long' };
  }

  if (sanitizedName.length > 100) {
    securityMonitor.monitorValidationFailure(name, 'project_name_length', {
      length: sanitizedName.length,
      maxAllowed: 100
    });
    return { isValid: false, error: 'Project name must be less than 100 characters' };
  }

  return { isValid: true };
};

export const validateAmount = (amount: number | string): { isValid: boolean; error?: string } => {
  if (amount === undefined || amount === null || amount === '') {
    return { isValid: false, error: 'Amount is required' };
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  if (numericAmount < 0) {
    return { isValid: false, error: 'Amount cannot be negative' };
  }

  if (numericAmount > 1000000) {
    return { isValid: false, error: 'Amount cannot exceed $1,000,000' };
  }

  // Check for too many decimal places
  const decimalPlaces = (numericAmount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { isValid: false, error: 'Amount cannot have more than 2 decimal places' };
  }

  return { isValid: true };
};