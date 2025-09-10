import { z } from 'zod';
import { useValidationMessages } from './i18n';

// Create a factory function for login schema that uses current language
export const createLoginSchema = () => {
  const messages = useValidationMessages();
  
  return z.object({
    email: z.string()
      .min(1, messages.required)
      .email(messages.invalidEmail),
    password: z.string()
      .min(1, messages.required)
      .min(6, messages.passwordMinLength),
  });
};

// Backward compatibility export
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const createSignUpSchema = () => {
  const messages = useValidationMessages();
  
  return z.object({
    name: z.string()
      .min(1, messages.fullNameRequired)
      .max(100, messages.nameMaxLength)
      .trim(),
    email: z.string()
      .min(1, messages.required)
      .email(messages.invalidEmail)
      .trim()
      .toLowerCase(),
    country: z.string()
      .min(1, messages.selectCountry),
    password: z.string()
      .min(6, messages.passwordMinLength)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, messages.passwordRequirements),
    confirmPassword: z.string()
      .min(1, messages.confirmPasswordRequired),
  }).refine((data) => data.password === data.confirmPassword, {
    message: messages.passwordsNoMatch,
    path: ['confirmPassword'],
  });
};

export const createChangePasswordSchema = () => {
  const messages = useValidationMessages();
  
  return z.object({
    currentPassword: z.string()
      .min(1, messages.currentPasswordRequired),
    newPassword: z.string()
      .min(6, messages.passwordMinLength)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, messages.passwordRequirements),
    confirmNewPassword: z.string()
      .min(1, messages.confirmNewPasswordRequired),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: messages.passwordsNoMatch,
    path: ['confirmNewPassword'],
  });
};

export const createForgotPasswordSchema = () => {
  const messages = useValidationMessages();
  
  return z.object({
    email: z.string()
      .min(1, messages.required)
      .email(messages.invalidEmail)
      .trim()
      .toLowerCase(),
  });
};

export const createResetPasswordSchema = () => {
  const messages = useValidationMessages();
  
  return z.object({
    password: z.string()
      .min(6, messages.passwordMinLength)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, messages.passwordRequirements),
    confirmPassword: z.string()
      .min(1, messages.confirmPasswordRequired),
  }).refine((data) => data.password === data.confirmPassword, {
    message: messages.passwordsNoMatch,
    path: ['confirmPassword'],
  });
};

// Backward compatibility export
export const signUpSchema = z.object({
  name: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Name is too long')
    .trim(),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  country: z.string()
    .min(1, 'Please select your country'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmNewPassword: z.string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;