
import React from 'react';
import FloatingContactButton from './FloatingContactButton';
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
    mobileMenuOpen,
    isLandingPage,
    handleSignOut,
    toggleMobileMenu
  } = useNavigation(user);
  
  // Use notifications hook at the Layout level
  const notificationsData = useNotifications(user);

  const onSignOutHandler = () => handleSignOut(onSignOut);

  // If user is not logged in or on landing page, show normal layout without sidebar
  if (!user || isLandingPage) {
    return (
      <div className="min-h-screen bg-white">
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
          <AppSidebar user={user} onSignOut={onSignOutHandler} />
          <SidebarInset className="flex-1">
            <div className="p-4">
              <SidebarTrigger className="mb-4" />
              <MainContent>
                {children}
              </MainContent>
            </div>
          </SidebarInset>
        </div>
        <FloatingContactButton />
      </SidebarProvider>
    </div>
  );
};

export default Layout;
