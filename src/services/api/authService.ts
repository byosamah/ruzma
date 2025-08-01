import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cleanupAuthState, logSecurityEvent, secureSignOut, secureSignIn } from '@/lib/authSecurity';
import { validateSignUpForm } from '@/utils/signUpValidation';

interface SignUpData {
  name: string;
  email: string;
  password: string;
  currency: string;
  country: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  currency: string;
  country?: string;
}

export const authService = {
  // Enhanced sign up with complete validation and security
  async signUp(formData: SignUpData) {
    try {
      console.log('Starting sign up process...');
      
      // Clean up any existing auth state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        console.warn('Pre-signup cleanup failed, continuing:', error);
      }

      // Validate currency
      const allowedCurrencies = ['SAR', 'JOD', 'USD', 'AED', 'GBP', 'EGP'];
      if (!allowedCurrencies.includes(formData.currency)) {
        throw new Error('Please select a valid currency');
      }

      const redirectUrl = `${window.location.origin}/`;
      
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
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long');
        } else {
          throw new Error(error.message || 'Failed to create account');
        }
      }

      if (data.user && !data.session) {
        toast.success('Please check your email and click the confirmation link to complete your registration.');
        logSecurityEvent('auth_signup_confirmation_sent', { userId: data.user.id });
      } else if (data.session) {
        toast.success('Account created successfully!');
        logSecurityEvent('auth_signup_success', { userId: data.user?.id });
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      logSecurityEvent('auth_signup_error', { error: String(error) });
      throw error;
    }
  },

  // Enhanced sign in with security cleanup
  async signIn(email: string, password: string, rememberMe: boolean = false) {
    try {
      return await secureSignIn(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      logSecurityEvent('auth_signin_error', { error: String(error) });
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in.');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a moment before trying again.');
        }
      }
      
      throw error;
    }
  },

  // Secure sign out with complete cleanup
  async signOut() {
    try {
      await secureSignOut();
      return { success: true };
    } catch (error) {
      console.error('Sign out failed:', error);
      logSecurityEvent('auth_signout_error', { error: String(error) });
      return { success: false, error };
    }
  },

  // Email confirmation resend with cooldown
  async resendConfirmation(email: string) {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('This email is already confirmed. Please try signing in instead.');
        } else if (error.message.includes('For security purposes')) {
          throw new Error('Please wait before requesting another confirmation email.');
        } else {
          throw new Error(error.message || 'Failed to resend confirmation email');
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      logSecurityEvent('auth_resend_error', { error: String(error) });
      throw error;
    }
  },

  // Update user metadata
  async updateUserMetadata(updates: Record<string, any>) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) {
        console.error('Update user metadata error:', error);
        throw error;
      }
      
      logSecurityEvent('auth_metadata_updated', { userId: data.user?.id });
      return { success: true, data };
    } catch (error) {
      console.error('Update metadata failed:', error);
      logSecurityEvent('auth_metadata_error', { error: String(error) });
      return { success: false, error };
    }
  },

  // Form validation
  validateSignUpForm(formData: FormData) {
    const validationErrors = validateSignUpForm(formData);
    
    // Additional currency validation
    const allowedCurrencies = ['SAR', 'JOD', 'USD', 'AED', 'GBP', 'EGP'];
    if (!allowedCurrencies.includes(formData.currency)) {
      validationErrors.currency = 'Please select a valid currency';
    }
    
    return validationErrors;
  }
};