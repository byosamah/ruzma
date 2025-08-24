
import { supabase } from '@/integrations/supabase/client';

// Comprehensive auth state cleanup to prevent limbo states
export const cleanupAuthState = () => {
  try {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear remembered email and other app-specific auth data
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberMe');
    
    // Remove from sessionStorage if in use
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    // Auth state cleaned successfully
  } catch (error) {
    // Silent cleanup - errors are not critical here
  }
};

// Secure sign out with complete cleanup
export const secureSignOut = async () => {
  try {
    // Clean up auth state first
    cleanupAuthState();
    
    // Attempt global sign out (with error handling)
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (signOutError) {
      // Continue with cleanup even if global signout fails
    }
    
    // Force page reload for clean state
    window.location.href = '/login';
  } catch (error) {
    // Force redirect even if there's an error
    window.location.href = '/login';
  }
};

// Enhanced sign in with security cleanup
export const secureSignIn = async (email: string, password: string) => {
  try {
    // Clean up any existing auth state
    cleanupAuthState();
    
    // Attempt to sign out any existing sessions
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      // Continue with signin even if cleanup fails
    }
    
    // Sign in with credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    if (data.user) {
      // Force page reload to ensure clean state
      window.location.href = '/dashboard';
      return data;
    }
    
    throw new Error('No user returned from sign in');
  } catch (error) {
    throw error;
  }
};

// Security event logging
export const logSecurityEvent = (event: string, details: Record<string, any> = {}) => {
  // Log security events for monitoring (could be sent to external service in production)
  const eventData = {
    event,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...details
  };
  // In production, this could be sent to a security monitoring service
};
