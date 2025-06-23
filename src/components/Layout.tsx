
import React from 'react';
import FloatingContactButton from './FloatingContactButton';
import Header from './Layout/Header';
import MainContent from './Layout/MainContent';
import { useNavigation } from '@/hooks/navigation/useNavigation';
import { useNotifications } from '@/hooks/useNotifications';

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
  onSignOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  onSignOut
}) => {
  const {
    userProfile,
    mobileMenuOpen,
    isActive,
    isLandingPage,
    shouldShowUpgradeButton,
    handleSignOut,
    toggleMobileMenu
  } = useNavigation(user);
  
  // Use notifications hook at the Layout level
  const notificationsData = useNotifications(user);

  const onSignOutHandler = () => handleSignOut(onSignOut);

  return (
    <div className="min-h-screen bg-white">
      <Header
        user={user}
        userProfile={userProfile}
        isActive={isActive}
        isLandingPage={isLandingPage}
        shouldShowUpgradeButton={shouldShowUpgradeButton}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={toggleMobileMenu}
        onSignOut={onSignOutHandler}
        notificationsData={notificationsData}
      />
      <MainContent>
        {children}
      </MainContent>
      <FloatingContactButton />
    </div>
  );
};

export default Layout;
