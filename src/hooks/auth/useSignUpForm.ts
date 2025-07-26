import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSignUpValidation } from './useSignUpValidation';
import { getCurrencyByCountry } from '@/lib/currency';
import { useT } from '@/lib/i18n';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  currency: string;
  country?: string;
}

export const useSignUpForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currency: 'USD', // Ensure default is one of the allowed values
    country: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { errors, validateForm, clearAllErrors } = useSignUpValidation();

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCountryChange = (countryCode: string) => {
    console.log('Country selected:', countryCode);
    
    // Automatically set currency based on country
    const currency = getCurrencyByCountry(countryCode);
    console.log('Auto-setting currency to:', currency);
    
    setFormData(prev => ({
      ...prev,
      country: countryCode,
      currency: currency
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      console.log('Form validation failed:', formData);
      return;
    }

    setIsLoading(true);
    clearAllErrors();

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;

      console.log('Signup attempt with currency:', formData.currency);
      console.log('Full signup data:', { 
        email: formData.email, 
        name: formData.name, 
        currency: formData.currency,
        country: formData.country
      });

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.name,
            currency: formData.currency,
            country: formData.country,
          }
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        throw error;
      }

      if (data.user) {
        console.log('Signup successful for user:', data.user.email);
        toast.success(t('accountCreatedSuccess'));
        const redirectTo = location.state?.from?.pathname || '/dashboard';
        navigate(redirectTo, { replace: true });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.message?.includes('currency') || error.message?.includes('constraint')) {
        toast.error(t('currencySelectionIssue'));
      } else if (error.message?.includes('Email rate limit exceeded')) {
        toast.error(t('tooManySignupAttempts'));
      } else {
        toast.error(error.message || t('accountCreationFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return {
    formData,
    errors,
    showPassword,
    showConfirmPassword,
    isLoading,
    handleFormDataChange,
    handleCountryChange,
    handleSubmit,
    handleTogglePassword,
    handleToggleConfirmPassword,
  };
};