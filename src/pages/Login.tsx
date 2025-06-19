
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { getSupabaseClient } from '@/integrations/supabase/authClient';
import { useT } from '@/lib/i18n';

const Login = () => {
  const t = useT();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMe") === "true"
  );
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Persist "Remember Me" choice
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }

    try {
      // Use appropriate storage and persistence
      const supabase = getSupabaseClient(rememberMe);

      // Clean up auth state and force sign out before new sign in
      // (See Supabase best practices)
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
        await supabase.auth.signOut({ scope: 'global' });
      } catch {}

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast.success(t('signInSuccess'));
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || t('loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-auth-background flex flex-col items-center justify-center p-3 sm:p-4">
      <div className="absolute top-6 sm:top-10 lg:top-16">
        <Link to="/">
          <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-8 sm:h-10" />
        </Link>
      </div>

      <Card className="w-full max-w-sm sm:max-w-md shadow-lg bg-white">
        <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">{t('loginWelcome')}</CardTitle>
          <p className="text-sm sm:text-base text-slate-600 mt-1">{t('loginSubtitle')}</p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex bg-slate-100 rounded-md p-1 mb-4 sm:mb-6">
            <Button variant="ghost" className="w-1/2 bg-white shadow-sm text-brand-navy font-semibold text-sm">{t('signIn')}</Button>
            <Button asChild variant="ghost" className="w-1/2 text-slate-500 text-sm">
              <Link to="/signup">{t('signUp')}</Link>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">{t('emailLabel')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-9 sm:pl-10 rtl:pr-9 rtl:sm:pr-10 rtl:pl-3 h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm">{t('passwordLabel')}</Label>
                <Link to="/forgot-password" className="text-xs sm:text-sm text-brand-yellow hover:underline">
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('passwordPlaceholder')}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-9 sm:pl-10 rtl:pr-9 rtl:sm:pr-10 rtl:pl-3 h-10 sm:h-11 text-sm sm:text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 rtl:left-0 rtl:right-auto top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="rememberMe"
                checked={rememberMe}
                onCheckedChange={checked => setRememberMe(!!checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="rememberMe" className="cursor-pointer select-none text-sm">
                {t('rememberMe')}
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-brand-yellow text-brand-black hover:bg-brand-yellow/90 h-10 sm:h-11 text-sm sm:text-base font-medium" 
              disabled={isLoading}
            >
              {isLoading ? t('signingIn') : t('signIn')}
            </Button>
          </form>

        </CardContent>
      </Card>
      <div className="absolute bottom-4 sm:bottom-8 text-xs sm:text-sm text-slate-600 text-center px-4">
        {t('footerRights', { year: new Date().getFullYear().toString() })}
      </div>
    </div>
  );
};

export default Login;
