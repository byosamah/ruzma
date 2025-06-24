
import React from 'react';
import FloatingContactButton from './FloatingContactButton';
import MainContent from './Layout/MainContent';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useNavigation } from '@/hooks/navigation/useNavigation';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
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
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
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
          <SidebarInset className="flex-1 min-w-0">
            <div className="p-2 sm:p-4 lg:p-6">
              <div className="mb-2 sm:mb-4">
                <SidebarTrigger className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <MainContent>
                <div className="px-2 sm:px-4 lg:px-6">
                  {children}
                </div>
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
