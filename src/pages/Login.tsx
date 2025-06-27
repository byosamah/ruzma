
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { getSupabaseClient } from '@/integrations/supabase/authClient';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { trackLogin } from '@/lib/analytics';

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
  const location = useLocation();
  const { user, loading: authLoading, authChecked } = useAuth();

  console.log('Login component render:', { user, authLoading, authChecked });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    console.log('Login useEffect:', { authChecked, user });
    if (authChecked && user) {
      const from = location.state?.from?.pathname || '/dashboard';
      console.log('Redirecting authenticated user to:', from);
      navigate(from, { replace: true });
    }
  }, [user, authChecked, navigate, location.state]);

  // Show loading while checking auth state - but with timeout
  if (!authChecked || authLoading) {
    console.log('Showing loading spinner');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  // If user is authenticated, show loading while redirecting
  if (user) {
    console.log('User authenticated, showing redirect loading');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  console.log('Rendering login form');

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
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Link to="/">
            <img 
              src="/lovable-uploads/d7c62fd0-8ad6-4696-b936-c40ca12c9886.png" 
              alt="Ruzma" 
              className="h-10 object-contain" 
            />
          </Link>
        </div>

        {/* Welcome Text */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-medium text-gray-900">{t('loginWelcome')}</h1>
          <p className="text-gray-600">{t('loginSubtitle')}</p>
        </div>

        {/* Auth Toggle */}
        <div className="flex bg-gray-50 rounded-lg p-1">
          <Button 
            variant="ghost" 
            className="flex-1 bg-white shadow-sm text-gray-900 font-medium hover:bg-white"
          >
            {t('signIn')}
          </Button>
          <Button 
            asChild 
            variant="ghost" 
            className="flex-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-medium"
          >
            <Link to="/signup">{t('signUp')}</Link>
          </Button>
        </div>

        {/* Login Form */}
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

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          {t('footerRights', { year: new Date().getFullYear().toString() })}
        </div>
      </div>
    </div>
  );
};

export default Login;
