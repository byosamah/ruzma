
import { useState } from 'react';
import { 
  sanitizeInput, 
  sanitizeHTML, 
  validateEmail, 
  validateProjectName, 
  validateAmount,
  validateJSONData 
} from '@/lib/inputValidation';
import { securityMonitor } from '@/lib/securityMonitoring';

interface ValidationRule {
  required?: boolean;
  type?: 'email' | 'projectName' | 'amount' | 'text' | 'html';
  maxLength?: number;
  minLength?: number;
  custom?: (value: any) => { isValid: boolean; error?: string };
}

interface FormValidationSchema {
  [key: string]: ValidationRule;
}

export const useSecureForm = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema: FormValidationSchema
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Secure value setter with validation and sanitization
  const setValue = (name: keyof T, value: any) => {
    const rule = validationSchema[name as string];
    
    // Sanitize input based on type
    let sanitizedValue = value;
    if (typeof value === 'string') {
      if (rule?.type === 'html') {
        sanitizedValue = sanitizeHTML(value);
      } else {
        sanitizedValue = sanitizeInput(value);
      }
      
      // Log if sanitization changed the value
      if (sanitizedValue !== value) {
        securityMonitor.monitorValidationFailure(
          value,
          'input_sanitization',
          { field: name as string, rule: rule?.type }
        );
      }
    }

    setValues(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate a single field
  const validateField = (name: keyof T, value: any): string | undefined => {
    const rule = validationSchema[name as string];
    if (!rule) return undefined;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${name as string} is required`;
    }

    // Skip further validation if field is empty and not required
    if (!value && !rule.required) return undefined;

    // Type-specific validation
    switch (rule.type) {
      case 'email': {
        const result = validateEmail(value);
        if (!result.isValid) return result.error;
        break;
      }
      case 'projectName': {
        const result = validateProjectName(value);
        if (!result.isValid) return result.error;
        break;
      }
      case 'amount': {
        const result = validateAmount(value);
        if (!result.isValid) return result.error;
        break;
      }
    }

    // Length validation
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${name as string} must be at least ${rule.minLength} characters`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${name as string} cannot exceed ${rule.maxLength} characters`;
      }
    }

    // Custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (!result.isValid) return result.error;
    }

    return undefined;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const [fieldName, value] of Object.entries(values)) {
      const error = validateField(fieldName as keyof T, value);
      if (error) {
        newErrors[fieldName as keyof T] = error;
        isValid = false;
        
        // Log validation failure
        securityMonitor.monitorValidationFailure(
          String(value),
          'form_validation',
          { field: fieldName, error }
        );
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Secure form submission handler
  const handleSubmit = async (
    onSubmit: (values: T) => Promise<void> | void,
    options: { 
      validateOnSubmit?: boolean;
      rateLimitKey?: string;
      rateLimitAttempts?: number;
      rateLimitWindow?: number;
    } = {}
  ) => {
    const {
      validateOnSubmit = true,
      rateLimitKey,
      rateLimitAttempts = 5,
      rateLimitWindow = 60000 // 1 minute
    } = options;

    if (isSubmitting) return;

    // Rate limiting check
    if (rateLimitKey) {
      const canProceed = securityMonitor.checkRateLimit(
        rateLimitKey,
        rateLimitAttempts,
        rateLimitWindow
      );
      
      if (!canProceed) {
        setErrors({ general: 'Too many attempts. Please try again later.' } as any);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Validate form if required
      if (validateOnSubmit && !validateForm()) {
        return;
      }

      // Additional security validation for JSON data
      const jsonValidation = validateJSONData(values);
      if (!jsonValidation.isValid) {
        securityMonitor.monitorSuspiciousActivity(
          'invalid_json_submission',
          { error: jsonValidation.error }
        );
        setErrors({ general: 'Invalid form data detected' } as any);
        return;
      }

      // Log successful form submission
      securityMonitor.monitorDataModification(
        'form_submission',
        'create_or_update',
        { formFields: Object.keys(values) }
      );

      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      securityMonitor.logEvent('suspicious_activity', {
        activity: 'form_submission_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      setErrors({ 
        general: 'Submission failed. Please try again.' 
      } as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    validateField,
    validateForm,
    handleSubmit,
    resetForm
  };
};
