import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/api/authService';
import { toast } from 'sonner';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { useT } from '@/lib/i18n';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  currency: string;
  country?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const useAuthManager = () => {
  const t = useT();
  // Sign up form state
  const [signUpData, setSignUpData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currency: 'USD',
    country: ''
  });
  
  // Login form state
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const { navigate: languageNavigate } = useLanguageNavigation();

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Form handlers
  const updateSignUpField = (field: keyof FormData, value: string) => {
    setSignUpData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const updateLoginField = (field: keyof LoginData, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleCountryChange = (countryCode: string) => {
    const countryToCurrency: Record<string, string> = {
      'SA': 'SAR',
      'JO': 'JOD', 
      'US': 'USD',
      'AE': 'AED',
      'GB': 'GBP',
      'EG': 'EGP'
    };

    setSignUpData(prev => ({
      ...prev,
      country: countryCode,
      currency: countryToCurrency[countryCode] || 'USD'
    }));
    clearError('country');
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

  // Toggle password visibility
  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  // Sign up flow
  const signUp = async () => {
    setIsLoading(true);
    clearAllErrors();

    try {
      // Validate form
      const validationErrors = authService.validateSignUpForm(signUpData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return false;
      }

      // Prepare sign up data
      const signUpPayload = {
        name: signUpData.name.trim(),
        email: signUpData.email.trim(),
        password: signUpData.password,
        currency: signUpData.currency,
        country: signUpData.country || ''
      };

      const { data } = await authService.signUp(signUpPayload);
      
      // Check if user needs email confirmation
      if (data.user && !data.session) {
        // Clear form data
        setSignUpData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          currency: 'USD',
          country: ''
        });
        
        // Navigate to email confirmation page with email
        languageNavigate(`/email-confirmation?email=${encodeURIComponent(signUpPayload.email)}`, {
          state: { email: signUpPayload.email }
        });
      } else {
        toast.success(t('accountCreated') || 'Account created successfully!');
      }
      return true;
    } catch (error) {
      console.error('Sign up failed:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create account. Please try again.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in flow
  const signIn = async (rememberMe: boolean = false) => {
    setIsLoading(true);
    clearAllErrors();

    try {
      // Basic validation
      if (!loginData.email.trim()) {
        setErrors({ email: 'Email is required' });
        return false;
      }
      if (!loginData.password) {
        setErrors({ password: 'Password is required' });
        return false;
      }

      // Store email for "Remember Me"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', loginData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      await authService.signIn(loginData.email, loginData.password, rememberMe);
      return true;
    } catch (error) {
      console.error('Sign in failed:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to sign in. Please try again.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Resend confirmation
  const resendConfirmation = async (email: string) => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before requesting another email.`);
      return false;
    }

    try {
      await authService.resendConfirmation(email);
      toast.success('Confirmation email sent! Please check your inbox.');
      setResendCooldown(60); // 60 second cooldown
      return true;
    } catch (error) {
      console.error('Resend confirmation failed:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to resend confirmation email. Please try again.');
      }
      return false;
    }
  };

  // Initialize remembered email for login
  const initializeRememberedEmail = () => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setLoginData(prev => ({ ...prev, email: rememberedEmail }));
    }
  };

  // Clear remembered email
  const clearRememberedEmail = () => {
    localStorage.removeItem('rememberedEmail');
    setLoginData(prev => ({ ...prev, email: '' }));
  };

  return {
    // Sign up state
    signUpData,
    updateSignUpField,
    handleCountryChange,
    showPassword,
    showConfirmPassword,
    togglePassword,
    toggleConfirmPassword,
    
    // Login state  
    loginData,
    updateLoginField,
    initializeRememberedEmail,
    clearRememberedEmail,
    
    // Shared state
    isLoading,
    errors,
    resendCooldown,
    clearError,
    clearAllErrors,
    
    // Actions
    signUp,
    signIn,
    resendConfirmation
  };
};