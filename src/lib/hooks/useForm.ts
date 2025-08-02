import { useForm as useReactHookForm, UseFormProps, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Enhanced form hook with common functionality
 */
export function useForm<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  options?: UseFormProps<T> & {
    onSubmit?: (data: T) => Promise<void> | void;
    successMessage?: string;
    errorMessage?: string;
    resetOnSuccess?: boolean;
  }
) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    onSubmit,
    successMessage = 'Success!',
    errorMessage = 'An error occurred',
    resetOnSuccess = false,
    ...formOptions
  } = options || {};

  const form = useReactHookForm<T>({
    resolver: zodResolver(schema),
    ...formOptions
  });

  const handleSubmit = form.handleSubmit(async (data: T) => {
    if (!onSubmit) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit(data);
      
      toast({
        title: successMessage,
        variant: 'default'
      });
      
      if (resetOnSuccess) {
        form.reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      const message = error instanceof Error ? error.message : errorMessage;
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
      
      // Set form error
      form.setError('root', { message });
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    ...form,
    handleSubmit,
    isSubmitting,
    // Helper methods
    setFieldError: (field: keyof T, message: string) => {
      form.setError(field as any, { message });
    },
    clearFieldError: (field: keyof T) => {
      form.clearErrors(field as any);
    },
    resetField: (field: keyof T) => {
      form.resetField(field as any);
    },
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    errors: form.formState.errors
  };
}

/**
 * Form field wrapper for consistent styling
 */
export function useFormField<T extends FieldValues>(
  form: ReturnType<typeof useForm<T>>,
  name: keyof T
) {
  const fieldState = form.getFieldState(name as any);
  const field = form.register(name as any);
  
  return {
    ...field,
    error: fieldState.error,
    isDirty: fieldState.isDirty,
    isTouched: fieldState.isTouched,
    isInvalid: !!fieldState.error,
    errorMessage: fieldState.error?.message
  };
}

/**
 * Common form validation schemas
 */
export const formSchemas = {
  email: z.string().email('Invalid email address'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: (passwordField: string) => 
    z.string().refine((val, ctx) => {
      const password = ctx.parent?.[passwordField];
      return val === password;
    }, 'Passwords do not match'),
  
  requiredString: (message = 'This field is required') => 
    z.string().min(1, message),
  
  optionalString: z.string().optional().nullable(),
  
  positiveNumber: z.number().positive('Must be a positive number'),
  
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  
  file: z.instanceof(File).optional(),
  
  date: z.string().or(z.date()).transform((val) => {
    if (typeof val === 'string') return new Date(val);
    return val;
  }),
  
  phoneNumber: z.string().regex(
    /^\+?[1-9]\d{1,14}$/, 
    'Invalid phone number'
  )
};

/**
 * Form utilities
 */
export const formUtils = {
  /**
   * Get form data as object
   */
  getFormData: (form: HTMLFormElement): Record<string, any> => {
    const formData = new FormData(form);
    const data: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      if (data[key]) {
        // Handle multiple values
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });
    
    return data;
  },
  
  /**
   * Set form values from object
   */
  setFormData: (form: HTMLFormElement, data: Record<string, any>) => {
    Object.entries(data).forEach(([key, value]) => {
      const input = form.elements.namedItem(key) as HTMLInputElement;
      if (input) {
        input.value = String(value || '');
      }
    });
  },
  
  /**
   * Clear form
   */
  clearForm: (form: HTMLFormElement) => {
    form.reset();
    // Clear any custom error states
    const errorElements = form.querySelectorAll('[aria-invalid="true"]');
    errorElements.forEach(el => el.removeAttribute('aria-invalid'));
  }
};