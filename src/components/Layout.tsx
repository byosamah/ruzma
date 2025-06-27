
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
  const {
    mobileMenuOpen,
    isLandingPage,
    handleSignOut,
    toggleMobileMenu
  } = useNavigation(user);
  
  const isMobile = useIsMobile();
  
  // Use notifications hook at the Layout level
  const notificationsData = useNotifications(user);

  const onSignOutHandler = () => handleSignOut(onSignOut);

  // If user is not logged in or on landing page, show normal layout without sidebar
  if (!user || isLandingPage) {
    return (
      <div className="min-h-screen bg-white">
        <MainContent>
          <div className={`${isMobile ? 'px-3 py-3' : 'px-6 py-6'} max-w-full overflow-x-hidden`}>
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
        <div className="min-h-screen flex w-full max-w-full overflow-x-hidden">
          <AppSidebar user={user} onSignOut={onSignOutHandler} />
          <SidebarInset className="flex-1 min-w-0 max-w-full">
            <div className={`${isMobile ? 'p-2' : 'p-4'} max-w-full`}>
              <div className="mb-3 md:mb-4">
                <SidebarTrigger className={`${isMobile ? 'min-h-[44px] min-w-[44px] touch-manipulation' : ''}`} />
              </div>
              <MainContent>
                <div className={`${isMobile ? 'space-y-3 max-w-full overflow-x-hidden' : 'space-y-6'}`}>
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
