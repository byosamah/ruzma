
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
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

    // Persist "Remember Me" choice for UI behavior
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('rememberedEmail', formData.email);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedEmail');
    }

    try {
      // Use the consistent default Supabase client
      // Clean up any existing sessions first
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
        
        // If "Remember Me" is false, set up session cleanup on browser close
        if (!rememberMe) {
          // Store a flag to indicate session should be temporary
          sessionStorage.setItem('temporarySession', 'true');
        }
        
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

  // Auto-fill email if remembered
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberMe && rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
    }
  }, [rememberMe]);

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
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
