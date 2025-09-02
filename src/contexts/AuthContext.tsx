import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/services/api/authService';
import { toast } from 'sonner';
import { logSecurityEvent } from '@/lib/authSecurity';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authChecked: boolean;
}

interface AuthActions {
  signUp: (formData: {
    email: string;
    password: string;
    name: string;
    currency: string;
    country: string;
  }) => Promise<{ success: boolean; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Error logged for debugging purposes only
          logSecurityEvent('auth_session_error', { error: error.message });
          toast.error('Authentication error');
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          logSecurityEvent('auth_session_restored', { userId: session.user.id });
        }
      } catch (error) {
        // Session error handled silently
        logSecurityEvent('auth_session_exception', { error: String(error) });
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
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

  const signUp = async (formData: {
    email: string;
    password: string;
    name: string;
    currency: string;
    country: string;
  }) => {
    const { data, error } = await authService.signUp(formData);
    
    if (error) {
      throw error;
    }

    // Check if user needs email confirmation
    const needsConfirmation = data.user && !data.session;
    
    return { 
      success: true, 
      needsConfirmation 
    };
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    await authService.signIn(email, password, rememberMe);
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const resendConfirmation = async (email: string) => {
    await authService.resendConfirmation(email);
  };

  const value = {
    user,
    session,
    loading,
    authChecked,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};