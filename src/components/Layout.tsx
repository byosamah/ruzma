
import React from 'react';
import FloatingContactButton from './FloatingContactButton';
import Header from './Layout/Header';
import MainContent from './Layout/MainContent';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
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

  // If user is not logged in or on landing page, show normal layout
  if (!user || isLandingPage) {
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
  }

  // For logged-in users, show sidebar layout
  return (
    <div className="min-h-screen bg-white">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar user={user} />
          <SidebarInset className="flex-1">
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
          </SidebarInset>
        </div>
        <FloatingContactButton />
      </SidebarProvider>
    </div>
  );
};

export default Layout;
