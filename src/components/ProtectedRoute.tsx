
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/dashboard/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, authChecked } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: State check', { 
    user: !!user, 
    loading, 
    authChecked, 
    pathname: location.pathname 
  });

  // Show loading while checking authentication
  if (loading || !authChecked) {
    console.log('ProtectedRoute: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login with return URL
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: User authenticated, rendering children');
  // User is authenticated, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
