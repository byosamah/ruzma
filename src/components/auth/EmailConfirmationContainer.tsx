import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/api/authService';
import { useT } from '@/lib/i18n';
import { toast } from 'sonner';

interface EmailConfirmationContainerProps {
  email: string;
}

function EmailConfirmationContainer({ email }: EmailConfirmationContainerProps) {
  const t = useT();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownTime > 0) {
      timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownTime]);

  const handleResendConfirmation = async () => {
    if (cooldownTime > 0 || isResending) return;

    setIsResending(true);
    try {
      await authService.resendConfirmation(email);
      toast.success(t('confirmationEmailSent'));
      setCooldownTime(40); // 40 second cooldown
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('confirmationEmailFailed');
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate('/login');
  };

  return (
    <>
      {/* Header */}
      <div className="text-center space-y-4">
        <Link to="/">
          <img src="/assets/logo-full-en.svg" alt="Ruzma Logo" className="h-10 mx-auto" />
        </Link>
        <div className="space-y-2">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('checkYourEmail')}</h1>
          <p className="text-gray-600">{t('emailConfirmationSubtitle')}</p>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-none">
        <CardContent className="p-0 space-y-6">
          {/* Email Display */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('confirmationSentTo')}</p>
            <p className="font-medium text-gray-900">{email}</p>
          </div>

          {/* Instructions */}
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p>{t('confirmationStep1')}</p>
            </div>
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p>{t('confirmationStep2')}</p>
            </div>
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p>{t('confirmationStep3')}</p>
            </div>
          </div>

          {/* Resend Button */}
          <div className="space-y-3">
            <Button
              onClick={handleResendConfirmation}
              disabled={cooldownTime > 0 || isResending}
              variant="outline"
              className="w-full h-11"
            >
              {isResending 
                ? t('resendingConfirmation') 
                : cooldownTime > 0 
                  ? t('resendCooldown', { seconds: cooldownTime.toString() })
                  : t('resendConfirmation')
              }
            </Button>

            <p className="text-xs text-gray-500 text-center">
              {t('noEmailReceived')}
            </p>
          </div>

          {/* Back to Sign In */}
          <Button
            onClick={handleBackToSignIn}
            variant="ghost"
            className="w-full h-11 text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {t('backToSignIn')}
          </Button>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600">
        {t('footerRights', { year: new Date().getFullYear().toString() })}
      </div>
    </>
  );
};

export default EmailConfirmationContainer;