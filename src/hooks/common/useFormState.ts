import { useState } from 'react';

export interface FormState<T> {
  data: T;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export const useFormState = <T extends Record<string, any>>(initialData: T) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const setFieldError = (field: keyof T, message: string) => {
    setErrors(prev => ({ ...prev, [field as string]: message }));
  };

  const clearErrors = () => setErrors({});

  const resetForm = () => {
    setFormData(initialData);
    setIsSubmitting(false);
    clearErrors();
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    errors,
    updateField,
    setFieldError,
    clearErrors,
    resetForm
  };
};