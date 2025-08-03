
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';

const ResetPassword = () => {
  const t = useT();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Set up auth state listener first to catch any session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session && session.user && mounted) {
          console.log('Session established via auth state change');
          setHasValidToken(true);
          setError(null);
          setIsValidatingToken(false);
        }
      }
    });

    const validateResetToken = async () => {
      console.log('=== Password Reset Token Validation ===');
      console.log('Full URL:', window.location.href);
      console.log('Hash:', window.location.hash);
      console.log('Search:', window.location.search);

      try {
        // Extract tokens from URL hash fragment (format: #access_token=...&refresh_token=...)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        const hashType = hashParams.get('type');

        // Extract from URL search parameters (format: ?token=...&type=recovery)
        const searchParams = new URLSearchParams(window.location.search);
        const searchAccessToken = searchParams.get('access_token');
        const searchRefreshToken = searchParams.get('refresh_token');
        const directToken = searchParams.get('token');
        const tokenType = searchParams.get('type');

        console.log('Token extraction results:', {
          hashAccessToken: hashAccessToken ? 'present' : 'missing',
          hashRefreshToken: hashRefreshToken ? 'present' : 'missing',
          hashType,
          searchAccessToken: searchAccessToken ? 'present' : 'missing', 
          searchRefreshToken: searchRefreshToken ? 'present' : 'missing',
          directToken: directToken ? 'present' : 'missing',
          tokenType
        });

        // Method 1: Try setting session with access/refresh tokens
        const finalAccessToken = hashAccessToken || searchAccessToken;
        const finalRefreshToken = hashRefreshToken || searchRefreshToken;

        if (finalAccessToken && finalRefreshToken) {
          console.log('Attempting to set session with extracted tokens...');
          const { data, error } = await supabase.auth.setSession({
            access_token: finalAccessToken,
            refresh_token: finalRefreshToken
          });

          if (!error && data.session && data.user) {
            console.log('Successfully established session with tokens');
            if (mounted) {
              setHasValidToken(true);
              setError(null);
              setIsValidatingToken(false);
            }
            return;
          } else {
            console.log('Failed to set session with tokens:', error?.message);
          }
        }

        // Method 2: Try exchanging direct recovery token
        if (directToken && tokenType === 'recovery') {
          console.log('Attempting to exchange recovery token...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(directToken);
          
          if (!error && data.session && data.user) {
            console.log('Successfully exchanged recovery token');
            if (mounted) {
              setHasValidToken(true);
              setError(null);
              setIsValidatingToken(false);
            }
            return;
          } else {
            console.log('Failed to exchange recovery token:', error?.message);
          }
        }

        // Method 3: Check for existing valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Current session check:', session?.user?.id, sessionError?.message);

        if (session && session.user) {
          console.log('Found existing valid session');
          if (mounted) {
            setHasValidToken(true);
            setError(null);
            setIsValidatingToken(false);
          }
          return;
        }

        // Method 4: Wait longer for Supabase redirect processing
        console.log('No immediate tokens found, waiting for delayed session...');
        timeoutId = setTimeout(async () => {
          if (!mounted) return;
          
          const { data: { session: delayedSession } } = await supabase.auth.getSession();
          console.log('Delayed session check:', delayedSession?.user?.id);
          
          if (delayedSession && delayedSession.user) {
            console.log('Found session after delay');
            setHasValidToken(true);
            setError(null);
            setIsValidatingToken(false);
          } else {
            console.log('No valid session found - link may be invalid/expired');
            setError('Invalid or expired reset link. The link may have already been used or has expired. Please request a new one.');
            setHasValidToken(false);
            setIsValidatingToken(false);
          }
        }, 3000); // Extended timeout for better reliability

      } catch (error: any) {
        console.error('Token validation error:', error);
        if (mounted) {
          setError(`Reset link validation failed: ${error.message || 'Please request a new reset link.'}`);
          setHasValidToken(false);
          setIsValidatingToken(false);
        }
      }
    };

    // Start validation with small delay to ensure page load
    timeoutId = setTimeout(() => {
      validateResetToken();
    }, 100);

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }

    if (password.length < 6) {
      toast.error(t('passwordLengthError'));
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting to update password');
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      console.log('Password updated successfully');
      toast.success(t('passwordUpdateSuccess'));
      
      // Sign out after password reset for security
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.message || t('passwordUpdateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="absolute top-10 sm:top-16">
          <Link to="/">
            <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-10" />
          </Link>
        </div>
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Validating reset link...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state if token is invalid
  if (!hasValidToken || error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="absolute top-10 sm:top-16">
          <Link to="/">
            <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-10" />
          </Link>
        </div>
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-gray-900">Invalid Reset Link</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                {error || 'This password reset link is invalid or has expired.'}
              </p>
              <Button asChild className="w-full bg-gray-900 text-white hover:bg-gray-800">
                <Link to="/forgot-password">Request New Reset Link</Link>
              </Button>
              <div className="mt-4">
                <Link to="/login" className="text-sm text-gray-900 hover:underline">
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="absolute bottom-8 text-sm text-gray-600">
          {t('footerRights', { year: new Date().getFullYear().toString() })}
        </div>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="absolute top-10 sm:top-16">
        <Link to="/">
          <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-10" />
        </Link>
      </div>
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">{t('setNewPasswordTitle')}</CardTitle>
            <p className="text-gray-600">{t('setNewPasswordSubtitle')}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('newPasswordLabel')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('enterNewPasswordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmNewPasswordLabel')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('confirmNewPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gray-900 text-white hover:bg-gray-800" 
                disabled={isLoading}
              >
                {isLoading ? t('updatingPassword') : t('updatePassword')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="absolute bottom-8 text-sm text-gray-600">
        {t('footerRights', { year: new Date().getFullYear().toString() })}
      </div>
    </div>
  );
};

export default ResetPassword;
