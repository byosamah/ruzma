
import { useState } from 'react';
import { validateSignUpForm } from '@/utils/signUpValidation';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  currency: string;
}

export const useSignUpValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (formData: FormData) => {
    const validationErrors = validateSignUpForm(formData);
    
    // Additional currency validation to ensure it matches database constraint
    const allowedCurrencies = ['SAR', 'JOD', 'USD', 'AED', 'GBP', 'EGP'];
    if (!allowedCurrencies.includes(formData.currency)) {
      validationErrors.currency = 'Please select a valid currency';
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateForm,
    clearError,
    clearAllErrors,
  };
};
