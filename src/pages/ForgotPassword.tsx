
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { forgotPasswordSchema } from '@/lib/validators/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { ROUTES } from '@/lib/constants/config';

const ForgotPassword = () => {
  const t = useT();
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: ROUTES.RESET_PASSWORD('en'),
      });

      if (error) {
        throw error;
      }

      setSentToEmail(data.email);
      setEmailSent(true);
      toast.success(t('passwordResetEmailSent'));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('passwordResetEmailFailed'));
      throw error; // Let form handle the error state
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        {/* Language Switcher - Top Right/Left based on direction */}
        <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10">
          <LanguageSelector 
            className="border-gray-200 bg-white" 
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
                {t('checkYourEmailSubtitle', { email: sentToEmail })}
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-none">
            <CardContent className="p-0 text-center space-y-4">
              <p className="text-sm text-gray-600">
                {t('checkYourEmailInfo')}
              </p>
              <Link to="/login" className="text-gray-900 font-medium">
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
                          placeholder={t('enterYourEmailPlaceholder')}
                          className="h-11 border-gray-200 focus:border-gray-400 focus:ring-0"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gray-900 text-white hover:bg-gray-800 font-medium rounded-lg" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('sendingResetLink') : t('sendResetLink')}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-gray-900">
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
