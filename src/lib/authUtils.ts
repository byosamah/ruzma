
import { supabase } from '@/integrations/supabase/client';

export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('sb-') || key.startsWith('supabase.auth.')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('sb-') || key.startsWith('supabase.auth.')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

export const preAuthCleanup = async () => {
    cleanupAuthState();
    try {
        await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
        console.error("Global sign out failed, continuing...", err);
    }
};
