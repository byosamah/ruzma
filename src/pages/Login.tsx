
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/dashboard/useAuth';
import LoginHeader from '@/components/auth/LoginHeader';
import AuthToggle from '@/components/auth/AuthToggle';
import LoginForm from '@/components/auth/LoginForm';
import LoginFooter from '@/components/auth/LoginFooter';

const Login = () => {
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
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
