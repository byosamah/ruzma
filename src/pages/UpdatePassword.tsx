
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Supabase handles the session state for password recovery.
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(t('updatePassword.errors.passwordLength', 'Password must be at least 6 characters long.'));
      return;
    }
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password: password });

    setIsLoading(false);

    if (error) {
      setError(error.message);
      toast({
        title: t('updatePassword.toast.errorTitle', 'Error updating password'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setMessage(t('updatePassword.successMessage', 'Your password has been updated successfully. You will be redirected to login shortly.'));
      toast({
        title: t('updatePassword.toast.successTitle', 'Password Updated'),
        description: t('updatePassword.toast.successDescription', 'You can now log in with your new password.'),
      });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle>{t('updatePassword.title', 'Update Your Password')}</CardTitle>
            <CardDescription>{t('updatePassword.description', 'Enter a new password below. You will be logged out after this.')}</CardDescription>
          </CardHeader>
          <CardContent>
            {message ? (
              <p className="text-green-600 text-center">{message}</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('updatePassword.passwordLabel', 'New Password')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('updatePassword.passwordPlaceholder', 'Enter your new password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                     <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 rtl:left-0 rtl:right-auto top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                    </Button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('updatePassword.submitButtonLoading', 'Updating...') : t('updatePassword.submitButton', 'Update Password')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
export default UpdatePassword;
