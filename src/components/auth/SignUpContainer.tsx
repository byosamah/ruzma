
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from './FormField';
import { PasswordField } from './PasswordField';
import { CurrencySelect } from './CurrencySelect';
import { User, Mail } from 'lucide-react';
import { useSignUpForm } from '@/hooks/auth/useSignUpForm';
import { useT } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';

const SignUpContainer: React.FC = () => {
  const t = useT();
  const {
    formData,
    errors,
    showPassword,
    showConfirmPassword,
    isLoading,
    handleFormDataChange,
    handleCurrencyChange,
    handleSubmit,
    handleTogglePassword,
    handleToggleConfirmPassword,
  } = useSignUpForm();

  return (
    <div className="min-h-screen bg-auth-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute top-8 sm:top-12 lg:top-16">
        <Link to="/">
          <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-8 sm:h-10" />
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg bg-white">
        <CardHeader className="text-center space-y-2 sm:space-y-3">
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">{t('welcomeToRuzma')}</CardTitle>
          <p className="text-sm sm:text-base text-slate-600">{t('signUpSubtitle')}</p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex bg-slate-100 rounded-md p-1 mb-4 sm:mb-6">
            <Button asChild variant="ghost" className="w-1/2 text-slate-500 text-sm">
              <Link to="/login">{t('signIn')}</Link>
            </Button>
            <Button variant="ghost" className="w-1/2 bg-white shadow-sm text-brand-navy font-semibold text-sm">{t('signUp')}</Button>
          </div>

          {/* Google Sign Up Button */}
          <Button 
            type="button"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/dashboard`
                }
              });
              if (error) {
                console.error('Google signup error:', error);
              }
            }}
            className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-10 sm:h-11 text-sm sm:text-base font-medium mb-4"
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('signUp')} with Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <FormField
              id="name"
              name="name"
              label={t('fullNameLabel')}
              placeholder={t('fullNamePlaceholder')}
              value={formData.name}
              onChange={handleFormDataChange}
              error={errors.name}
              icon={User}
              required
            />

            <FormField
              id="email"
              name="email"
              type="email"
              label={t('emailLabel')}
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChange={handleFormDataChange}
              error={errors.email}
              icon={Mail}
              required
            />

            <CurrencySelect
              value={formData.currency}
              onChange={handleCurrencyChange}
              error={errors.currency}
            />
            
            <PasswordField
              id="password"
              name="password"
              label={t('passwordLabel')}
              placeholder={t('passwordPlaceholder')}
              value={formData.password}
              onChange={handleFormDataChange}
              error={errors.password}
              showPassword={showPassword}
              onTogglePassword={handleTogglePassword}
              required
            />

            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label={t('confirmPasswordLabel')}
              placeholder={t('confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChange={handleFormDataChange}
              error={errors.confirmPassword}
              showPassword={showConfirmPassword}
              onTogglePassword={handleToggleConfirmPassword}
              required
            />

            <Button 
              type="submit" 
              className="w-full bg-brand-yellow text-brand-black hover:bg-brand-yellow/90 h-10 sm:h-11 text-sm sm:text-base font-medium mt-4 sm:mt-6" 
              disabled={isLoading}
            >
              {isLoading ? t('creatingAccount') : t('createAccount')}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="absolute bottom-6 sm:bottom-8 text-xs sm:text-sm text-slate-600 text-center px-4">
        {t('footerRights', { year: new Date().getFullYear().toString() })}
      </div>
    </div>
  );
};

export default SignUpContainer;
