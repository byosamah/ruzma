
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CountrySelect } from '@/components/ui/country-select';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useAuthManager } from '@/hooks/useAuthManager';
import { useT } from '@/lib/i18n';
import { signUpSchema } from '@/lib/validators/auth';
import GoogleAuthButton from './GoogleAuthButton';

function SignUpContainer() {
  const t = useT();
  const {
    signUpData,
    updateSignUpField,
    handleCountryChange,
    isLoading,
    signUp,
  } = useAuthManager();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: signUpData.name,
      email: signUpData.email,
      country: signUpData.country || '',
      password: signUpData.password,
      confirmPassword: signUpData.confirmPassword,
    },
  });

  // Watch form changes and sync with useAuthManager
  const formValues = form.watch();
  useEffect(() => {
    // Sync form data with useAuthManager state
    if (formValues.name !== signUpData.name) {
      updateSignUpField('name', formValues.name);
    }
    if (formValues.email !== signUpData.email) {
      updateSignUpField('email', formValues.email);
    }
    if (formValues.country !== signUpData.country) {
      handleCountryChange(formValues.country);
    }
    if (formValues.password !== signUpData.password) {
      updateSignUpField('password', formValues.password);
    }
    if (formValues.confirmPassword !== signUpData.confirmPassword) {
      updateSignUpField('confirmPassword', formValues.confirmPassword);
    }
  }, [formValues, signUpData, updateSignUpField, handleCountryChange]);

  const onSubmit = async (data: SignUpFormData) => {
    // Sync the data with useAuthManager and call signUp
    updateSignUpField('name', data.name);
    updateSignUpField('email', data.email);
    updateSignUpField('password', data.password);
    updateSignUpField('confirmPassword', data.confirmPassword);
    handleCountryChange(data.country);
    
    // Use a small delay to ensure state update has taken effect
    setTimeout(() => {
      signUp();
    }, 0);
  };

  return (
    <>
      {/* Header - matches Login */}
      <div className="text-center space-y-4">
        <Link to="/">
          <img src="/assets/logo-full-en.svg" alt="Ruzma Logo" className="h-10 mx-auto" />
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
          {/* Google Sign Up at the top */}
          <div className="mb-6">
            <GoogleAuthButton 
              mode="signup" 
              disabled={isLoading}
            />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('fullNameLabel')} *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-lg">
                          👤
                        </span>
                        <Input
                          {...field}
                          placeholder={t('fullNamePlaceholder')}
                          className="pl-10 rtl:pl-3 rtl:pr-10 h-11 border-gray-200 focus:border-gray-400 focus:ring-0"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('emailLabel')} *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-lg">
                          📧
                        </span>
                        <Input
                          {...field}
                          type="email"
                          placeholder={t('emailPlaceholder')}
                          className="pl-10 rtl:pl-3 rtl:pr-10 h-11 border-gray-200 focus:border-gray-400 focus:ring-0"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CountrySelect
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        required
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('passwordLabel')} *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('passwordPlaceholder')}
                          className="pl-10 rtl:pl-3 rtl:pr-10 pr-10 h-11 border-gray-200 focus:border-gray-400 focus:ring-0"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 rtl:right-auto rtl:left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                          ) : (
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
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
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('confirmPasswordLabel')} *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t('confirmPasswordPlaceholder')}
                          className="pl-10 rtl:pl-3 rtl:pr-10 pr-10 h-11 border-gray-200 focus:border-gray-400 focus:ring-0"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 rtl:right-auto rtl:left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                          ) : (
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
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
                className="w-full h-11 bg-gray-900 text-white hover:bg-gray-800 font-medium rounded-lg" 
                disabled={isLoading}
              >
                {isLoading ? t('creatingAccount') : t('createAccount')}
              </Button>
            </form>
          </Form>
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
