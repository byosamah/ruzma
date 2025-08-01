
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthManager } from '@/hooks/useAuthManager';
import { useT } from '@/lib/i18n';

interface LoginFormProps {
  rememberMe: boolean;
  setRememberMe: (checked: boolean) => void;
}

const LoginForm = ({ rememberMe, setRememberMe }: LoginFormProps) => {
  const t = useT();
  const {
    loginData,
    updateLoginField,
    initializeRememberedEmail,
    isLoading,
    signIn,
  } = useAuthManager();

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (rememberMe) {
      initializeRememberedEmail();
    }
  }, [rememberMe, initializeRememberedEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(rememberMe);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateLoginField(name as keyof typeof loginData, value);
  };

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
              value={loginData.email}
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
                value={loginData.password}
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
