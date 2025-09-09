import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { logSecurityEvent } from '@/lib/authSecurity';

function AuthCallback() {
  const { navigate } = useLanguageNavigation();
  const { lang } = useParams<{ lang: string }>();
  const { language: currentLanguage } = useLanguage();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logSecurityEvent('oauth_callback_error', { error: error.message });
          // Redirect to login with error
          navigate('/login?error=oauth_failed', { replace: true });
          return;
        }

        if (data.session?.user) {
          logSecurityEvent('oauth_callback_success', { userId: data.session.user.id });
          // Wait a moment for the auth state to settle
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 100);
        } else {
          // No session found, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        logSecurityEvent('oauth_callback_exception', { error: String(error) });
        navigate('/login?error=oauth_exception', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

export default AuthCallback;