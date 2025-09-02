
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { resetPasswordSchema } from '@/lib/validators/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';

const ResetPassword = () => {
  const t = useT();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Set up auth state listener first to catch any session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session && session.user && mounted) {
          setHasValidToken(true);
          setError(null);
          setIsValidatingToken(false);
        }
      }
    });

    const validateResetToken = async () => {
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

        // Method 1: Try setting session with access/refresh tokens
        const finalAccessToken = hashAccessToken || searchAccessToken;
        const finalRefreshToken = hashRefreshToken || searchRefreshToken;

        if (finalAccessToken && finalRefreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: finalAccessToken,
            refresh_token: finalRefreshToken
          });

          if (!error && data.session && data.user) {
            if (mounted) {
              setHasValidToken(true);
              setError(null);
              setIsValidatingToken(false);
            }
            return;
          }
        }

        // Method 2: Try exchanging direct recovery token
        if (directToken && tokenType === 'recovery') {
          const { data, error } = await supabase.auth.exchangeCodeForSession(directToken);
          
          if (!error && data.session && data.user) {
            if (mounted) {
              setHasValidToken(true);
              setError(null);
              setIsValidatingToken(false);
            }
            return;
          }
        }

        // Method 3: Check for existing valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (session && session.user) {
          if (mounted) {
            setHasValidToken(true);
            setError(null);
            setIsValidatingToken(false);
          }
          return;
        }

        // Method 4: Wait longer for Supabase redirect processing
        timeoutId = setTimeout(async () => {
          if (!mounted) return;
          
          const { data: { session: delayedSession } } = await supabase.auth.getSession();
          
          if (delayedSession && delayedSession.user) {
            setHasValidToken(true);
            setError(null);
            setIsValidatingToken(false);
          } else {
            setError('Invalid or expired reset link. The link may have already been used or has expired. Please request a new one.');
            setHasValidToken(false);
            setIsValidatingToken(false);
          }
        }, 3000); // Extended timeout for better reliability

      } catch (error: unknown) {
        if (mounted) {
          setError(`Reset link validation failed: ${error instanceof Error ? error.message : 'Please request a new reset link.'}`);
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

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        throw error;
      }

      toast.success(t('passwordUpdateSuccess'));
      
      // Sign out after password reset for security
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('passwordUpdateFailed');
      toast.error(errorMessage);
      throw error; // Let form handle the error state
    }
  };

  // Show loading state while validating token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="absolute top-10 sm:top-16">
          <Link to="/">
            <img src="/assets/logo-full-en.svg" alt="Ruzma Logo" className="h-10" />
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
            <img src="/assets/logo-full-en.svg" alt="Ruzma Logo" className="h-10" />
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
          <img src="/assets/logo-full-en.svg" alt="Ruzma Logo" className="h-10" />
        </Link>
      </div>
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">{t('setNewPasswordTitle')}</CardTitle>
            <p className="text-gray-600">{t('setNewPasswordSubtitle')}</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('newPasswordLabel')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('enterNewPasswordPlaceholder')}
                            disabled={isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isSubmitting}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('confirmNewPasswordLabel')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder={t('confirmNewPasswordPlaceholder')}
                            disabled={isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isSubmitting}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-gray-900 text-white hover:bg-gray-800" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('updatingPassword') : t('updatePassword')}
                </Button>
              </form>
            </Form>
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
