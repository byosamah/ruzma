
import React from 'react';
import { User } from '@supabase/supabase-js';
import LanguageSelector from '../LanguageSelector';
import LogoSection from './LogoSection';
import NavigationMenu from './NavigationMenu';
import MobileMenu from './MobileMenu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Notification } from '@/types/notifications';
import { UserProfile } from '@/types/profile';

interface NotificationData {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

interface HeaderProps {
  user: User | null;
  userProfile: UserProfile | null;
  isActive: (path: string) => boolean;
  isLandingPage: boolean;
  shouldShowUpgradeButton: boolean;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onSignOut: () => void;
  notificationsData?: NotificationData;
}

const Header = ({
  user,
  userProfile,
  isActive,
  isLandingPage,
  shouldShowUpgradeButton,
  mobileMenuOpen,
  onToggleMobileMenu,
  onSignOut,
  notificationsData
}) => {
  const isMobile = useIsMobile();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className={`${isMobile ? 'max-w-full px-3' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
        <div className={`flex justify-between items-center ${isMobile ? 'h-14' : 'h-16'} min-w-0`}>
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            {/* Show sidebar trigger for logged-in users */}
            {user && !isLandingPage && (
              <SidebarTrigger className="md:hidden touch-manipulation min-h-[44px] min-w-[44px]" />
            )}
            <LogoSection user={user} isLandingPage={isLandingPage} />
            <div className="hidden sm:block flex-shrink-0">
              <LanguageSelector className="border-0 shadow-none p-1" />
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            <NavigationMenu
              user={user}
              userProfile={userProfile}
              isActive={isActive}
              isMobile={false}
              shouldShowUpgradeButton={shouldShowUpgradeButton}
              onSignOut={onSignOut}
              onMenuClick={() => {}}
              notificationsData={notificationsData}
            />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <div className="sm:hidden">
              <LanguageSelector className="border-0 shadow-none p-1 text-xs" />
            </div>
            <MobileMenu
              mobileMenuOpen={mobileMenuOpen}
              onToggle={onToggleMobileMenu}
              user={user}
              userProfile={userProfile}
              isActive={isActive}
              shouldShowUpgradeButton={shouldShowUpgradeButton}
              onSignOut={onSignOut}
              notificationsData={notificationsData}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
