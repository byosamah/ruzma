
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/core/useAuth';
import { useProfileQuery } from '@/hooks/core/useProfileQuery';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProtectedRouteProps {
  children: React.ReactNode | ((props: { user: any; profile: any }) => React.ReactNode);
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, authChecked } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfileQuery(user);
  const { navigate } = useLanguageNavigation();
  const { language } = useLanguage();

  // Show loading while checking authentication or fetching profile
  if (loading || !authChecked || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login with current language
  if (!user) {
    return <Navigate to={`/${language}/login`} replace />;
  }

  // User is authenticated, render the protected component with user data
  if (typeof children === 'function') {
    return <>{children({ user, profile })}</>;
  }
  
  return React.cloneElement(children as React.ReactElement, { user, profile });
};

export default ProtectedRoute;
