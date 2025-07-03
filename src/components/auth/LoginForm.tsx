
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { getSupabaseClient } from '@/integrations/supabase/authClient';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/lib/i18n';
import { trackLogin } from '@/lib/analytics';

interface LoginFormProps {
  rememberMe: boolean;
  setRememberMe: (checked: boolean) => void;
}

const LoginForm = ({ rememberMe, setRememberMe }: LoginFormProps) => {
  const t = useT();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted');
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
      } catch (cleanupError) {
        console.log('Cleanup error (non-fatal):', cleanupError);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Track successful login
        trackLogin('email');
        
        toast.success(t('signInSuccess'));
        const redirectTo = location.state?.from?.pathname || '/dashboard';
        console.log('Login successful, redirecting to:', redirectTo);
        window.location.href = redirectTo;
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
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        {/* Google Sign In Button */}
        <Button 
          type="button"
          onClick={async () => {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/dashboard`
              }
            });
            if (error) {
              console.error('Google signin error:', error);
            }
          }}
          className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-11 text-base font-medium mb-4"
          variant="outline"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('signIn')} with Google
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              {t('emailLabel')}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              required
              className="h-11 border-gray-200 focus:border-gray-400 focus:ring-0"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                {t('passwordLabel')}
              </Label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                {t('forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
                required
                className="h-11 border-gray-200 focus:border-gray-400 focus:ring-0 pr-10 rtl:pl-10 rtl:pr-3"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 rtl:left-0 rtl:right-auto top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox 
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={checked => setRememberMe(!!checked)}
              className="h-4 w-4"
            />
            <Label 
              htmlFor="rememberMe" 
              className="text-sm text-gray-600 cursor-pointer select-none"
            >
              {t('rememberMe')}
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-gray-900 text-white hover:bg-gray-800 font-medium rounded-lg" 
            disabled={isLoading}
          >
            {isLoading ? t('signingIn') : t('signIn')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
