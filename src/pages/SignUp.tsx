
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/core/useAuth';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import SignUpContainer from '@/components/auth/SignUpContainer';
import LanguageSelector from '@/components/LanguageSelector';

const SignUp = () => {
  const { navigate } = useLanguageNavigation();
  const location = useLocation();
  const { user, loading: authLoading, authChecked } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (authChecked && user) {
      const from = location.state?.from?.pathname;
      if (from && from !== '/') {
        navigate(from, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, authChecked, navigate, location.state]);

  // Show loading while checking auth state
  if (authLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  // Don't render signup form if user is authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      {/* Language Switcher - Top Right/Left based on direction */}
      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10">
        <LanguageSelector 
          className="border-gray-200 hover:border-gray-300 bg-white" 
          showTextWhenCollapsed={true}
        />
      </div>
      
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <SignUpContainer />
      </div>
    </div>
  );
};

export default SignUp;
