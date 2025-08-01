import { securityMonitor } from '../security/monitoring';

export const validateJSONData = (data: any): { isValid: boolean; error?: string } => {
  try {
    const jsonString = JSON.stringify(data);
    
    // Check size limit (1MB)
    const sizeInBytes = new Blob([jsonString]).size;
    if (sizeInBytes > 1024 * 1024) {
      securityMonitor.monitorValidationFailure('json_data', 'size_limit', {
        size: sizeInBytes,
        maxAllowed: 1024 * 1024
      });
      return { isValid: false, error: 'Data size exceeds 1MB limit' };
    }

    // Check for potential XSS in JSON data
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i
    ];

    const hasDangerousContent = dangerousPatterns.some(pattern => 
      pattern.test(jsonString)
    );

    if (hasDangerousContent) {
      securityMonitor.monitorSuspiciousActivity('xss_attempt_in_json', {
        dataPreview: jsonString.substring(0, 200)
      });
      return { isValid: false, error: 'Data contains potentially dangerous content' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid JSON data' };
  }
};

export const validateRequired = (value: any, fieldName: string): { isValid: boolean; error?: string } => {
  if (value === undefined || value === null || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

export const validateLength = (
  value: string, 
  min: number, 
  max: number, 
  fieldName: string
): { isValid: boolean; error?: string } => {
  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be a string` };
  }

  if (value.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters long` };
  }

  if (value.length > max) {
    return { isValid: false, error: `${fieldName} must be less than ${max} characters` };
  }

  return { isValid: true };
};