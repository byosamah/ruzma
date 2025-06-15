
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';

const ForgotPassword = () => {
  const t = useT();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast.success(t('passwordResetEmailSent'));
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || t('passwordResetEmailFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-auth-background flex flex-col items-center justify-center p-4">
        <div className="absolute top-10 sm:top-16">
          <Link to="/">
            <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-10" />
          </Link>
        </div>
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-800">{t('checkYourEmailTitle')}</CardTitle>
              <p className="text-slate-600">
                {t('checkYourEmailSubtitle', { email })}
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-slate-600 mb-4">
                {t('checkYourEmailInfo')}
              </p>
              <Link to="/login" className="text-brand-yellow hover:underline font-medium">
                {t('backToLogin')}
              </Link>
            </CardContent>
          </Card>
        </div>
        <div className="absolute bottom-8 text-sm text-slate-600">
          {t('footerRights', { year: new Date().getFullYear().toString() })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-auth-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-10 sm:top-16">
        <Link to="/">
          <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-10" />
        </Link>
      </div>
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800">{t('resetPasswordTitle')}</CardTitle>
            <p className="text-slate-600">{t('resetPasswordSubtitle')}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailLabel')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('enterYourEmailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-brand-yellow text-brand-black hover:bg-brand-yellow/90" 
                disabled={isLoading}
              >
                {isLoading ? t('sendingResetLink') : t('sendResetLink')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-brand-yellow hover:underline">
                {t('backToLogin')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
       <div className="absolute bottom-8 text-sm text-slate-600">
          {t('footerRights', { year: new Date().getFullYear().toString() })}
        </div>
    </div>
  );
};

export default ForgotPassword;
