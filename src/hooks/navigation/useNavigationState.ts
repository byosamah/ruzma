
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useNavigationState = (user: any) => {
  const location = useLocation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (!error) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const shouldShowUpgradeButton = user && userProfile?.user_type !== 'pro';

  return {
    userProfile,
    mobileMenuOpen,
    setMobileMenuOpen,
    isActive,
    isLandingPage,
    shouldShowUpgradeButton
  };
};
