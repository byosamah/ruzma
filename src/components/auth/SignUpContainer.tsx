
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from './FormField';
import { PasswordField } from './PasswordField';
import { CountrySelect } from '@/components/ui/country-select';
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
    handleCountryChange,
    handleSubmit,
    handleTogglePassword,
    handleToggleConfirmPassword,
  } = useSignUpForm();

  return (
    <>
      {/* Header - matches Login */}
      <div className="text-center space-y-4">
        <Link to="/">
          <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-10 mx-auto" />
        </Link>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">{t('welcomeToRuzma')}</h1>
          <p className="text-gray-600">{t('signUpSubtitle')}</p>
        </div>
      </div>

      {/* Auth Toggle - matches Login */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <Button asChild variant="ghost" className="w-1/2 text-gray-600 font-medium">
          <Link to="/login">{t('signIn')}</Link>
        </Button>
        <Button variant="ghost" className="w-1/2 bg-white shadow-sm text-gray-900 font-medium">{t('signUp')}</Button>
      </div>

      {/* Form - matches Login structure */}
      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full h-11 bg-gray-900 text-white hover:bg-gray-800 font-medium rounded-lg" 
              disabled={isLoading}
            >
              {isLoading ? t('creatingAccount') : t('createAccount')}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Footer - matches Login */}
      <div className="text-center text-sm text-gray-600">
        {t('footerRights', { year: new Date().getFullYear().toString() })}
      </div>
    </>
  );
};

export default SignUpContainer;
