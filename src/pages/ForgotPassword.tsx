
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';

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
        redirectTo: 'https://app.ruzma.co/en/reset-password',
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast.success(t('passwordResetEmailSent'));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('passwordResetEmailFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        {/* Language Switcher - Top Right/Left based on direction */}
        <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10">
          <LanguageSelector 
            className="border-gray-200 hover:border-gray-300 bg-white" 
            showTextWhenCollapsed={true}
          />
        </div>
        
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center space-y-4">
            <Link to="/">
              <img src="/assets/logo-full-en.svg" alt="Ruzma Logo" className="h-10 mx-auto" />
            </Link>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900">{t('checkYourEmailTitle')}</h1>
              <p className="text-gray-600">
                {t('checkYourEmailSubtitle', { email })}
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-none">
            <CardContent className="p-0 text-center space-y-4">
              <p className="text-sm text-gray-600">
                {t('checkYourEmailInfo')}
              </p>
              <Link to="/login" className="text-gray-900 hover:underline font-medium">
                {t('backToLogin')}
              </Link>
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-gray-600">
            {t('footerRights', { year: new Date().getFullYear().toString() })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      {/* Language Switcher - Top Right/Left based on direction */}
      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10">
        <LanguageSelector 
          className="border-gray-200 hover:border-gray-300 bg-white" 
          showTextWhenCollapsed={true}
        />
      </div>
      
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center space-y-4">
          <Link to="/">
            <img src="/assets/logo-full-en.svg" alt="Ruzma Logo" className="h-10 mx-auto" />
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">{t('resetPasswordTitle')}</h1>
            <p className="text-gray-600">{t('resetPasswordSubtitle')}</p>
          </div>
        </div>

        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">{t('emailLabel')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('enterYourEmailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-gray-200 focus:border-gray-400 focus:ring-0"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gray-900 text-white hover:bg-gray-800 font-medium rounded-lg" 
                disabled={isLoading}
              >
                {isLoading ? t('sendingResetLink') : t('sendResetLink')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-gray-900 hover:underline">
                {t('backToLogin')}
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-gray-600">
          {t('footerRights', { year: new Date().getFullYear().toString() })}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
