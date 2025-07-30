import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/lib/authSecurity';

export const authService = {
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      logSecurityEvent('auth_signout_manual');
      return { success: true };
    } catch (error) {
      console.error('Sign out failed:', error);
      logSecurityEvent('auth_signout_error', { error: String(error) });
      return { success: false, error };
    }
  },

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
  }
};