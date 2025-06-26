
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSignUpValidation } from './useSignUpValidation';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  currency: string;
}

export const useSignUpForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currency: 'USD'
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

  const handleCurrencyChange = (currency: string) => {
    setFormData(prev => ({
      ...prev,
      currency
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);
    clearAllErrors();

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.name,
            currency: formData.currency,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast.success('Account created successfully! Please check your email for verification.');
        const redirectTo = location.state?.from?.pathname || '/dashboard';
        navigate(redirectTo, { replace: true });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
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
    handleCurrencyChange,
    handleSubmit,
    handleTogglePassword,
    handleToggleConfirmPassword,
  };
};
