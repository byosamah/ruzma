
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/core/useAuth';
import LoginHeader from '@/components/auth/LoginHeader';
import AuthToggle from '@/components/auth/AuthToggle';
import LoginForm from '@/components/auth/LoginForm';
import LoginFooter from '@/components/auth/LoginFooter';
import LanguageSelector from '@/components/LanguageSelector';

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, authChecked } = useAuth();

  // Initialize "Remember Me" state from localStorage
  useEffect(() => {
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    setRememberMe(savedRememberMe);
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (authChecked && user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, authChecked, navigate, location.state]);

  // Show loading while checking auth state - but with timeout
  if (!authChecked || authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  // If user is authenticated, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

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
        <LoginHeader />
        <AuthToggle />
        <LoginForm 
          rememberMe={rememberMe} 
          setRememberMe={setRememberMe} 
        />
        <LoginFooter />
      </div>
    </div>
  );
};

export default Login;
