
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, authChecked } = useAuth();
  const { getCurrentPath } = useLanguageNavigation();

  // Show loading while checking authentication
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login with current language
  if (!user) {
    const currentPath = getCurrentPath();
    return <Navigate to="/login" state={{ from: currentPath }} replace />;
  }

  // User is authenticated, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
