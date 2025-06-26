
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/dashboard/useAuth';
import SignUpContainer from '@/components/auth/SignUpContainer';

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, authChecked } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (authChecked && user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, authChecked, navigate, location.state]);

  // Show loading while checking auth state
  if (authLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-auth-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  // Don't render signup form if user is authenticated
  if (user) {
    return null;
  }

  return <SignUpContainer />;
};

export default SignUp;
