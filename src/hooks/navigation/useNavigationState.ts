
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useProfileQuery } from '@/hooks/core/useProfileQuery';

export const useNavigationState = (user: any) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: userProfile } = useProfileQuery(user);

  const isActive = (path: string) => location.pathname === path;
  const isLandingPage = location.pathname === '/';
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
