
import React from 'react';
import LanguageSelector from '../LanguageSelector';
import LogoSection from './LogoSection';
import NavigationMenu from './NavigationMenu';
import MobileMenu from './MobileMenu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  user: any;
  userProfile: any;
  isActive: (path: string) => boolean;
  isLandingPage: boolean;
  shouldShowUpgradeButton: boolean;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onSignOut: () => void;
  notificationsData?: any;
}

const Header: React.FC<HeaderProps> = ({
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            {/* Show sidebar trigger for logged-in users */}
            {user && !isLandingPage && (
              <SidebarTrigger className="md:hidden" />
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
          <div className="md:hidden flex items-center space-x-2 flex-shrink-0">
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
