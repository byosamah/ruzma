
import React from 'react';
import LanguageSelector from '../LanguageSelector';
import LogoSection from './LogoSection';
import NavigationMenu from './NavigationMenu';
import MobileMenu from './MobileMenu';
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
    <nav className="bg-background text-foreground border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <LogoSection user={user} isLandingPage={isLandingPage} />
            <div className="hidden sm:block flex-shrink-0">
              <LanguageSelector className="border-0 shadow-none p-1" />
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
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
