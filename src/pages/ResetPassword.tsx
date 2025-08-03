
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
    const validateResetToken = async () => {
      console.log('Current URL:', window.location.href);
      console.log('Current hash:', window.location.hash);
      console.log('Current search:', window.location.search);

      try {
        // First, check if we have a valid session (Supabase may have already set it)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Current session:', session, 'error:', sessionError);

        if (session && session.user) {
          console.log('User has valid session, allowing password reset');
          setHasValidToken(true);
          setError(null);
          return;
        }

        // If no session, try to get it from URL hash (Supabase redirects with tokens in hash)
        const hash = window.location.hash;
        if (hash) {
          console.log('Found hash parameters:', hash);
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');

          console.log('Hash params - type:', type, 'accessToken:', !!accessToken, 'refreshToken:', !!refreshToken);

          if (accessToken && refreshToken && type === 'recovery') {
            console.log('Setting session with tokens from hash');
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('Error setting session from hash:', error);
              throw new Error('Invalid or expired password reset link. Please request a new one.');
            }

            console.log('Session set successfully from hash:', data);
            setHasValidToken(true);
            setError(null);
            return;
          }
        }

        // Check URL search params as fallback
        const searchParams = new URLSearchParams(window.location.search);
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        console.log('Search params - type:', type, 'accessToken:', !!accessToken, 'refreshToken:', !!refreshToken);

        if (accessToken && refreshToken && type === 'recovery') {
          console.log('Setting session with tokens from search params');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session from search params:', error);
            throw new Error('Invalid or expired password reset link. Please request a new one.');
          }

          console.log('Session set successfully from search params:', data);
          setHasValidToken(true);
          setError(null);
          return;
        }

        // If we reach here, no valid session or tokens were found
        console.log('No valid session or tokens found');
        throw new Error('Invalid or expired password reset link. Please request a new one.');

      } catch (error: any) {
        console.error('Token validation error:', error);
        setError(error.message || 'Invalid or expired password reset link. Please request a new one.');
        setHasValidToken(false);
      } finally {
        setIsValidatingToken(false);
      }
    };

    // Set up auth state listener to handle automatic session updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        if (session && session.user) {
          console.log('Session updated via auth state change');
          setHasValidToken(true);
          setError(null);
          setIsValidatingToken(false);
        }
      }
    });

    // Start validation
    validateResetToken();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
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
