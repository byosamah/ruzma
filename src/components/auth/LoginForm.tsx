
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthManager } from '@/hooks/useAuthManager';
import { useT } from '@/lib/i18n';
import { loginSchema, LoginFormData } from '@/lib/validators/auth';
import GoogleAuthButton from './GoogleAuthButton';

interface LoginFormProps {
  rememberMe: boolean;
  setRememberMe: (checked: boolean) => void;
}

const LoginForm = ({ rememberMe, setRememberMe }: LoginFormProps) => {
  const t = useT();
  const { getPathWithLanguage } = useLanguageNavigation();
  const {
    loginData,
    updateLoginField,
    initializeRememberedEmail,
    isLoading,
    signIn,
  } = useAuthManager();

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: loginData.email,
      password: loginData.password,
    },
  });

  // Initialize remembered email when component mounts
  useEffect(() => {
    if (rememberMe && !loginData.email) {
      initializeRememberedEmail();
    }
  }, [rememberMe, loginData.email, initializeRememberedEmail]);

  // Update form when loginData changes (from remembered email)
  useEffect(() => {
    if (loginData.email !== form.getValues('email')) {
      form.setValue('email', loginData.email);
    }
  }, [loginData.email, form]);

  // Watch form changes and sync with useAuthManager
  const formValues = form.watch();
  useEffect(() => {
    if (formValues.email !== loginData.email) {
      updateLoginField('email', formValues.email);
    }
    if (formValues.password !== loginData.password) {
      updateLoginField('password', formValues.password);
    }
  }, [formValues.email, formValues.password, loginData.email, loginData.password, updateLoginField]);

  const onSubmit = async (data: LoginFormData) => {
    // Ensure the loginData is synced before calling signIn
    updateLoginField('email', data.email);
    updateLoginField('password', data.password);
    
    // Use a small delay to ensure state update has taken effect
    setTimeout(() => {
      signIn(rememberMe);
    }, 0);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        {/* Google Sign In at the top */}
        <div className="mb-6">
          <GoogleAuthButton 
            mode="signin" 
            disabled={isLoading}
          />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">{t('or')}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t('emailLabel')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      className="h-11 border-gray-200 focus:border-gray-400 focus:ring-0"
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
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('passwordLabel')}
                    </FormLabel>
                    <Link 
                      to={getPathWithLanguage('/forgot-password')} 
                      className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                    >
                      {t('forgotPassword')}
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('passwordPlaceholder')}
                        className="h-11 border-gray-200 focus:border-gray-400 focus:ring-0 pr-10 rtl:pl-10 rtl:pr-3"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 rtl:left-0 rtl:right-auto top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
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

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox 
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={checked => setRememberMe(!!checked)}
                className="h-4 w-4"
                disabled={isLoading}
              />
              <label 
                htmlFor="rememberMe" 
                className="text-sm text-gray-600 cursor-pointer select-none"
              >
                {t('rememberMe')}
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gray-900 text-white hover:bg-gray-800 font-medium rounded-lg" 
              disabled={isLoading}
            >
              {isLoading ? t('signingIn') : t('signIn')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
