
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { logSecurityEvent } from '@/lib/authSecurity';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('useAuth: useEffect triggered, authChecked =', authChecked);
    if (authChecked) return;
    
    let isMounted = true;
    
    const fetchUser = async () => {
      console.log('useAuth: fetchUser starting, isMounted =', isMounted);
      if (!isMounted) return;
      
      console.log('Dashboard: Starting secure auth check...');
      logSecurityEvent('dashboard_auth_check_started');
      
      try {
        // Handle auth tokens from URL hash (email confirmation)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
          console.log('Dashboard: Processing auth tokens from URL hash');
          logSecurityEvent('email_confirmation_token_processing');
          
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('Dashboard: Error setting session from URL:', error);
              logSecurityEvent('email_confirmation_failed', { error: error.message });
              toast.error('Authentication failed. Please try logging in again.');
            } else {
              console.log('Dashboard: Session set successfully from URL tokens');
              logSecurityEvent('email_confirmation_success');
              toast.success('Email confirmed successfully! Welcome to Ruzma.');
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname);
            }
          }
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('Dashboard: Auth result -', { 
          hasUser: !!user, 
          userEmail: user?.email,
          emailConfirmed: user?.email_confirmed_at,
          error: userError?.message 
        });
        
        // Add debug logging for the dashboard issue
        console.log('useAuth: About to set user state', { 
          user: !!user, 
          userError: !!userError,
          isMounted 
        });
        
        if (!isMounted) return;
        
        if (userError || !user) {
          console.log('Dashboard: No authenticated user found');
          logSecurityEvent('dashboard_auth_failed', { error: userError?.message });
          setUser(null);
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        // Check if user's email is confirmed
        if (!user.email_confirmed_at) {
          console.log('Dashboard: User email not confirmed');
          logSecurityEvent('dashboard_unconfirmed_email', { userId: user.id });
          toast.error('Please confirm your email address before accessing your account.');
          
          // Sign out the unconfirmed user
          await supabase.auth.signOut();
          
          setUser(null);
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        setUser(user);
        logSecurityEvent('dashboard_auth_success', { userId: user.id });
        console.log('Dashboard: User authenticated and confirmed');
      } catch (error) {
        console.error('Dashboard: Unexpected error:', error);
        logSecurityEvent('dashboard_unexpected_error', { error: error instanceof Error ? error.message : 'Unknown error' });
        if (isMounted) {
          setUser(null);
          setLoading(false);
          setAuthChecked(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setAuthChecked(true);
          console.log('Dashboard: Auth check complete');
        }
      }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('useAuth: Auth check timeout triggered');
      if (!authChecked && isMounted) {
        console.warn('Auth check timeout - forcing completion');
        setLoading(false);
        setAuthChecked(true);
      }
    }, 10000); // 10 second timeout

    console.log('useAuth: About to call fetchUser');
    fetchUser();
    
    return () => {
      console.log('useAuth: Cleanup function called');
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [authChecked, navigate]);

  return {
    user,
    loading,
    authChecked,
  };
};
