import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { Checkbox } from "@/components/ui/checkbox";
import { preAuthCleanup } from '@/lib/authUtils';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    await preAuthCleanup();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    console.log('[Login] Data:', data);
    console.log('[Login] Error:', error);

    if (error) {
      setError(error.message);
      toast({
        title: t('toast.loginErrorTitle'),
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // If no session and no error, the most likely cause is "unconfirmed email".
    if (!data.session) {
      setError(t('login.checkConfirmationOrReset') || "Login failed. Please confirm your email or reset your password.");
      toast({
        title: t('toast.loginErrorTitle'),
        description: t('login.checkConfirmationOrReset') || "No active session could be created. Please check your email for confirmation or try resetting your password.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    window.location.href = '/dashboard';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800">{t('login.title')}</CardTitle>
            <p className="text-slate-600">{t('login.subtitle')}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('login.emailLabel')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('login.passwordLabel')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('login.passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 rtl:left-0 rtl:right-auto top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember-me">{t('login.rememberMe')}</Label>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? t('login.submitButtonLoading') : t('login.submitButton')}
              </Button>
            </form>
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-slate-600">
                {t('login.noAccount')}{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  {t('login.signUpLink')}
                </Link>
              </p>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                {t('login.forgotPasswordLink')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
