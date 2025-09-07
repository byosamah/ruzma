import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logSecurityEvent } from '@/lib/authSecurity';

// Sync Google profile picture to user profile
const syncGoogleProfilePicture = async (user: User): Promise<void> => {
  try {
    const googleAvatarUrl = user.user_metadata.avatar_url;
    if (!googleAvatarUrl) return;

    // Check if user already has a profile picture set
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    // Only sync if user doesn't have a profile picture or it's different from Google's
    if (!profile?.avatar_url || profile.avatar_url !== googleAvatarUrl) {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: googleAvatarUrl })
        .eq('id', user.id);

      if (error) {
        logSecurityEvent('google_avatar_sync_failed', { 
          userId: user.id, 
          error: error.message 
        });
      } else {
        logSecurityEvent('google_avatar_synced', { 
          userId: user.id,
          avatarUrl: googleAvatarUrl 
        });
      }
    }
  } catch (error) {
    logSecurityEvent('google_avatar_sync_exception', { 
      userId: user.id, 
      error: String(error) 
    });
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const syncedUserIds = useRef(new Set<string>());

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Error getting session handled by caller
          logSecurityEvent('auth_session_error', { error: error.message });
          toast.error('Authentication error');
          return;
        }

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
      (event, session) => {
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

  // Separate effect for Google profile picture sync to avoid blocking auth state
  useEffect(() => {
    if (user && 
        user.app_metadata.provider === 'google' && 
        user.user_metadata.avatar_url &&
        !syncedUserIds.current.has(user.id)) {
      
      // Mark as synced immediately to prevent duplicate calls
      syncedUserIds.current.add(user.id);
      
      // Use setTimeout to ensure this runs after auth state is settled
      const timeout = setTimeout(() => {
        syncGoogleProfilePicture(user);
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [user]);

  // Clear synced user IDs on sign out
  useEffect(() => {
    if (!user) {
      syncedUserIds.current.clear();
    }
  }, [user]);

  return {
    user,
    loading,
    authChecked
  };
};