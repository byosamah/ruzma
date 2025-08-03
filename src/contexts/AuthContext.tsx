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
  signUp: (formData: any) => Promise<{ success: boolean; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

interface AuthContextType extends AuthState, AuthActions {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
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

        setSession(session);
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

  const signUp = async (formData: any) => {
    try {
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
    } catch (error: any) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      await authService.signIn(email, password, rememberMe);
    } catch (error: any) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error: any) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      await authService.resendConfirmation(email);
    } catch (error: any) {
      console.error('Resend confirmation failed:', error);
      throw error;
    }
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