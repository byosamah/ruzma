
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
    
    // Remove from sessionStorage if in use
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('Auth state cleaned up');
  } catch (error) {
    console.error('Error cleaning auth state:', error);
  }
};

// Secure sign out with complete cleanup
export const secureSignOut = async () => {
  try {
    console.log('Starting secure sign out...');
    
    // Clean up auth state first
    cleanupAuthState();
    
    // Attempt global sign out (with error handling)
    try {
      await supabase.auth.signOut({ scope: 'global' });
      console.log('Global sign out successful');
    } catch (signOutError) {
      console.warn('Global sign out failed, continuing with cleanup:', signOutError);
    }
    
    // Force page reload for clean state
    window.location.href = '/login';
  } catch (error) {
    console.error('Error during secure sign out:', error);
    // Force redirect even if there's an error
    window.location.href = '/login';
  }
};

// Enhanced sign in with security cleanup
export const secureSignIn = async (email: string, password: string) => {
  try {
    console.log('Starting secure sign in...');
    
    // Clean up any existing auth state
    cleanupAuthState();
    
    // Attempt to sign out any existing sessions
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.warn('Pre-signin cleanup failed, continuing:', error);
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
      console.log('Sign in successful, redirecting...');
      // Force page reload to ensure clean state
      window.location.href = '/dashboard';
      return data;
    }
    
    throw new Error('No user returned from sign in');
  } catch (error) {
    console.error('Secure sign in error:', error);
    throw error;
  }
};

// Security event logging
export const logSecurityEvent = (event: string, details: Record<string, any> = {}) => {
  console.log(`SECURITY_EVENT: ${event}`, {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...details
  });
};
