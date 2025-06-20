
import React, { useState } from 'react';
import SignUpContainer from '@/components/auth/SignUpContainer';
import EmailConfirmationScreen from '@/components/auth/EmailConfirmationScreen';
import { useSignUpValidation } from '@/hooks/auth/useSignUpValidation';
import { useSignUpAuth } from '@/hooks/auth/useSignUpAuth';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currency: 'USD'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const { errors, validateForm, clearError } = useSignUpValidation();
  const { isLoading, resendCooldown, signUp, resendConfirmation } = useSignUpAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    const result = await signUp(formData);
    if (result.success && result.needsConfirmation) {
      setIsEmailSent(true);
    }
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    clearError(e.target.name);
  };

  const handleCurrencyChange = (currency: string) => {
    setFormData(prev => ({
      ...prev,
      currency
    }));
    
    clearError('currency');
  };

  const handleResendConfirmation = async () => {
    await resendConfirmation(formData.email);
  };

  if (isEmailSent) {
    return (
      <EmailConfirmationScreen
        email={formData.email}
        isLoading={isLoading}
        resendCooldown={resendCooldown}
        onResendConfirmation={handleResendConfirmation}
      />
    );
  }

  return (
    <SignUpContainer
      formData={formData}
      errors={errors}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      isLoading={isLoading}
      onFormDataChange={handleFormDataChange}
      onCurrencyChange={handleCurrencyChange}
      onSubmit={handleSubmit}
      onTogglePassword={() => setShowPassword(!showPassword)}
      onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
    />
  );
};

export default SignUp;
