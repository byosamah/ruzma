
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SignUpForm from '@/components/auth/SignUpForm';
import EmailConfirmationScreen from '@/components/auth/EmailConfirmationScreen';
import { validateSignUpForm } from '@/utils/signUpValidation';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateSignUpForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Attempting to sign up with email:', formData.email);
      
      // Use hub.ruzma.co for redirect URL
      const redirectUrl = 'https://hub.ruzma.co';
      console.log('Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
          emailRedirectTo: redirectUrl
        }
      });

      console.log('SignUp response:', { data, error });

      if (error) {
        console.error('SignUp error:', error);
        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please try logging in instead.');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        if (!data.session) {
          // User created but needs email confirmation - this is the correct flow
          console.log('User created, email confirmation required');
          toast.success('Account created! Please check your email and click the confirmation link to complete your registration.');
          setIsEmailSent(true);
        } else {
          // This shouldn't happen if email confirmation is enabled
          console.warn('User was automatically confirmed - check Supabase settings');
          toast.success('Account created and signed in successfully!');
          navigate('/dashboard');
        }
      } else {
        toast.error('Failed to create account. Please try again.');
      }
      
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
  };

  const handleResendConfirmation = async () => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before trying again.`);
      return;
    }

    if (!formData.email) {
      toast.error('Email address is required to resend confirmation.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting to resend confirmation email to:', formData.email);
      
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: 'https://hub.ruzma.co'
        }
      });

      console.log('Resend response:', { data, error });

      if (error) {
        console.error('Resend error:', error);
        
        // Handle rate limiting specifically
        if (error.message.includes('security purposes') || error.message.includes('after')) {
          // Extract the number of seconds from the error message if possible
          const secondsMatch = error.message.match(/(\d+)\s+seconds?/);
          const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 60;
          
          setResendCooldown(seconds);
          toast.error(`Please wait ${seconds} seconds before requesting another confirmation email.`);
          
          // Start countdown
          const interval = setInterval(() => {
            setResendCooldown(prev => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and click the confirmation link first.');
        } else {
          toast.error(`Failed to resend confirmation email: ${error.message}`);
        }
      } else {
        console.log('Confirmation email resent successfully');
        toast.success('Confirmation email sent! Please check your inbox and spam folder.');
        
        // Set a small cooldown to prevent spam
        setResendCooldown(30);
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Unexpected error during resend:', error);
      toast.error('Failed to resend confirmation email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show confirmation sent screen
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
    <SignUpForm
      formData={formData}
      errors={errors}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      isLoading={isLoading}
      onFormDataChange={handleFormDataChange}
      onSubmit={handleSubmit}
      onTogglePassword={() => setShowPassword(!showPassword)}
      onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
    />
  );
};

export default SignUp;
