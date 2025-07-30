import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logSecurityEvent } from '@/lib/authSecurity';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          logSecurityEvent('auth_session_error', { error: error.message });
          toast.error('Authentication error');
          return;
        }

        setUser(session?.user ?? null);
        
        if (session?.user) {
          logSecurityEvent('auth_session_restored', { userId: session.user.id });
        }
      } catch (error) {
        console.error('Session error:', error);
        logSecurityEvent('auth_session_exception', { error: String(error) });
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        setAuthChecked(true);
        
        if (event === 'SIGNED_IN' && session?.user) {
          logSecurityEvent('auth_signin', { userId: session.user.id });
        } else if (event === 'SIGNED_OUT') {
          logSecurityEvent('auth_signout');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    authChecked
  };
};