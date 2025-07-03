
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode | ((props: { user: any; profile: any }) => React.ReactNode);
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, authChecked } = useAuth();
  const { navigate } = useLanguageNavigation();
  const { language } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch profile data when user is available
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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
