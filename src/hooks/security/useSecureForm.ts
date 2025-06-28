
import { useState, useCallback } from 'react';
import { sanitizeInput, rateLimiter } from '@/lib/security/inputSanitization';
import { toast } from 'sonner';
import { logSecurityEvent } from '@/lib/authSecurity';

interface FormValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type?: 'text' | 'email' | 'url' | 'phone';
  custom?: (value: string) => string | null;
}

interface FormValidationRules {
  [key: string]: FormValidationRule;
}

export const useSecureForm = <T extends Record<string, any>>(
  initialData: T,
  validationRules: FormValidationRules = {},
  rateLimitKey?: string
) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: string, value: string): string | null => {
    const rules = validationRules[name];
    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || value.trim().length === 0)) {
      return `${name} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim().length === 0) return null;

    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      return `${name} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${name} must not exceed ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${name} format is invalid`;
    }

    // Type-specific validation
    if (rules.type === 'email') {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(value)) {
        return `${name} must be a valid email address`;
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) return customError;
    }

    return null;
  }, [validationRules]);

  const handleChange = useCallback((name: keyof T, value: string) => {
    // Sanitize input based on field type
    const fieldRules = validationRules[name as string];
    const sanitizedValue = sanitizeInput(value, {
      maxLength: fieldRules?.maxLength || 1000,
      type: fieldRules?.type || 'text'
    });

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear previous error and validate
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }));

    const error = validateField(name as string, sanitizedValue);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validateField, validationRules]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const value = formData[fieldName as keyof T] as string || '';
      const error = validateField(fieldName, value);
      if (error) {
        newErrors[fieldName as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField, validationRules]);

  const handleSubmit = useCallback(async (
    submitHandler: (data: T) => Promise<void>,
    options: { skipRateLimit?: boolean } = {}
  ) => {
    // Rate limiting check
    if (rateLimitKey && !options.skipRateLimit) {
      if (!rateLimiter.checkLimit(rateLimitKey, 10, 60000)) {
        toast.error('Too many attempts. Please wait before trying again.');
        logSecurityEvent('form_rate_limit_exceeded', { formType: rateLimitKey });
        return;
      }
    }

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitHandler(formData);
      logSecurityEvent('secure_form_submitted', { formType: rateLimitKey || 'unknown' });
    } catch (error) {
      console.error('Form submission error:', error);
      logSecurityEvent('form_submission_error', { 
        formType: rateLimitKey || 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, rateLimitKey]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    validateForm,
    reset
  };
};
