
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
      toast({
        title: t('forgotPassword.toast.errorTitle', 'Error'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setMessage(t('forgotPassword.successMessage', 'If an account exists for this email, a password reset link has been sent.'));
      toast({
        title: t('forgotPassword.toast.successTitle', 'Check your email'),
        description: t('forgotPassword.toast.successDescription', 'A password reset link has been sent to your email address.'),
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle>{t('forgotPassword.title', 'Forgot Password')}</CardTitle>
            <CardDescription>{t('forgotPassword.description', 'Enter your email to receive a password reset link.')}</CardDescription>
          </CardHeader>
          <CardContent>
            {message ? (
              <p className="text-green-600 text-center">{message}</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('forgotPassword.emailLabel', 'Email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('forgotPassword.emailPlaceholder', 'you@example.com')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('forgotPassword.submitButtonLoading', 'Sending...') : t('forgotPassword.submitButton', 'Send Reset Link')}
                </Button>
              </form>
            )}
            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700">
                {t('forgotPassword.backToLogin', 'Back to Login')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
export default ForgotPassword;
