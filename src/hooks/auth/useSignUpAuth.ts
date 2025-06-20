
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SignUpData {
  name: string;
  email: string;
  password: string;
  currency: string;
}

export const useSignUpAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  const signUp = async (formData: SignUpData) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting to sign up with email:', formData.email);
      
      const redirectUrl = 'https://hub.ruzma.co';
      console.log('Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            currency: formData.currency,
          },
          emailRedirectTo: redirectUrl
        }
      });

      console.log('SignUp response:', { data, error });

      if (error) {
        console.error('SignUp error:', error);
        
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please try logging in instead.');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else {
          toast.error(error.message);
        }
        return { success: false, error };
      }

      if (data.user) {
        if (!data.session) {
          console.log('User created, email confirmation required');
          toast.success('Account created! Please check your email and click the confirmation link to complete your registration.');
          return { success: true, needsConfirmation: true };
        } else {
          console.warn('User was automatically confirmed - check Supabase settings');
          toast.success('Account created and signed in successfully!');
          navigate('/dashboard');
          return { success: true, needsConfirmation: false };
        }
      } else {
        toast.error('Failed to create account. Please try again.');
        return { success: false, error: new Error('Failed to create account') };
      }
      
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmation = async (email: string) => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before trying again.`);
      return { success: false };
    }

    if (!email) {
      toast.error('Email address is required to resend confirmation.');
      return { success: false };
    }

    setIsLoading(true);
    try {
      console.log('Attempting to resend confirmation email to:', email);
      
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'https://hub.ruzma.co'
        }
      });

      console.log('Resend response:', { data, error });

      if (error) {
        console.error('Resend error:', error);
        
        if (error.message.includes('security purposes') || error.message.includes('after')) {
          const secondsMatch = error.message.match(/(\d+)\s+seconds?/);
          const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 60;
          
          setResendCooldown(seconds);
          toast.error(`Please wait ${seconds} seconds before requesting another confirmation email.`);
          
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
        return { success: false, error };
      } else {
        console.log('Confirmation email resent successfully');
        toast.success('Confirmation email sent! Please check your inbox and spam folder.');
        
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
        return { success: true };
      }
    } catch (error) {
      console.error('Unexpected error during resend:', error);
      toast.error('Failed to resend confirmation email. Please try again.');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    resendCooldown,
    signUp,
    resendConfirmation,
  };
};
