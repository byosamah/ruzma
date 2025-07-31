
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from './FormField';
import { PasswordField } from './PasswordField';
import { CountrySelect } from '@/components/ui/country-select';
// Icons replaced with emojis
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
    handleCountryChange,
    handleSubmit,
    handleTogglePassword,
    handleToggleConfirmPassword,
  } = useSignUpForm();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <Link to="/">
          <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-8 sm:h-10 mx-auto mb-4" />
        </Link>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('welcomeToRuzma')}</h2>
        <p className="mt-2 text-sm text-gray-600">{t('signUpSubtitle')}</p>
      </div>

      <div className="flex bg-gray-50 rounded-lg p-1">
        <Button asChild variant="ghost" className="w-1/2 text-gray-500 hover:text-gray-700">
          <Link to="/login">{t('signIn')}</Link>
        </Button>
        <Button variant="ghost" className="w-1/2 bg-white shadow-sm text-gray-900 font-medium">{t('signUp')}</Button>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              id="name"
              name="name"
              label={t('fullNameLabel')}
              placeholder={t('fullNamePlaceholder')}
              value={formData.name}
              onChange={handleFormDataChange}
              error={errors.name}
              emoji="👤"
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
              emoji="📧"
              required
            />

            <CountrySelect
              value={formData.country || ''}
              onChange={handleCountryChange}
              error={errors.country}
              required
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
              className="w-full bg-gray-900 text-white hover:bg-gray-800 h-11 font-medium" 
              disabled={isLoading}
            >
              {isLoading ? t('creatingAccount') : t('createAccount')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpContainer;
