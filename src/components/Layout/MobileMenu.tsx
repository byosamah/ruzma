
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
        className="ml-2"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-2 pt-2 pb-3 space-y-2">
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
