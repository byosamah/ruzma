
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import NavigationMenu from './NavigationMenu';

interface MobileMenuProps {
  mobileMenuOpen: boolean;
  onToggle: () => void;
  user?: any;
  userProfile?: any;
  isActive: (path: string) => boolean;
  shouldShowUpgradeButton: boolean;
  onSignOut: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  mobileMenuOpen,
  onToggle,
  user,
  userProfile,
  isActive,
  shouldShowUpgradeButton,
  onSignOut,
}) => {
  const handleMenuClick = () => {
    onToggle();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="h-8 w-8 sm:h-10 sm:w-10 p-1 sm:p-2"
      >
        {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
      </Button>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-t border-border bg-background shadow-lg z-50">
          <div className="px-3 sm:px-4 pt-3 pb-4 space-y-2 max-h-[80vh] overflow-y-auto">
            <NavigationMenu
              user={user}
              userProfile={userProfile}
              isActive={isActive}
              isMobile={true}
              shouldShowUpgradeButton={shouldShowUpgradeButton}
              onSignOut={onSignOut}
              onMenuClick={handleMenuClick}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
