
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
