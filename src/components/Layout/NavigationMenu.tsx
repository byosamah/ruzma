
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, User, LogOut, TrendingUp } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavigationMenuProps {
  user?: any;
  userProfile?: any;
  isActive: (path: string) => boolean;
  isMobile: boolean;
  shouldShowUpgradeButton: boolean;
  onSignOut: () => void;
  onMenuClick: () => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  user,
  userProfile,
  isActive,
  isMobile,
  shouldShowUpgradeButton,
  onSignOut,
  onMenuClick,
}) => {
  const t = useT();

  if (!user) {
    return (
      <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex items-center space-x-3'}`}>
        <Link to="/login" onClick={onMenuClick} className={isMobile ? 'w-full' : ''}>
          <Button 
            variant="ghost" 
            size={isMobile ? "default" : "sm"} 
            className={`${isMobile ? 'w-full justify-start' : ''} text-sm`}
          >
            {t("login")}
          </Button>
        </Link>
        <Link to="/signup" onClick={onMenuClick} className={isMobile ? 'w-full' : ''}>
          <Button 
            size={isMobile ? "default" : "sm"} 
            variant="secondary" 
            className={`${isMobile ? 'w-full justify-start' : ''} text-sm`}
          >
            {t("signUp")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex items-center space-x-3'}`}>
      {shouldShowUpgradeButton && (
        <Link to="/plans" onClick={onMenuClick} className={isMobile ? 'w-full' : ''}>
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"}
            className={`bg-gradient-to-r from-brand-yellow to-yellow-500 text-brand-black border-0 hover:from-yellow-400 hover:to-yellow-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-sm ${isMobile ? 'w-full justify-start' : ''}`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Upgrade
          </Button>
        </Link>
      )}
      <Link to="/dashboard" onClick={onMenuClick} className={isMobile ? 'w-full' : ''}>
        <Button 
          variant={isActive('/dashboard') ? 'secondary' : 'ghost'} 
          size={isMobile ? "default" : "sm"} 
          className={`${isMobile ? 'w-full justify-start' : 'justify-center'} text-sm`}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          {t("dashboard")}
        </Button>
      </Link>
      <Link to="/profile" onClick={onMenuClick} className={isMobile ? 'w-full' : ''}>
        <Button 
          variant={isActive('/profile') ? 'secondary' : 'ghost'} 
          size={isMobile ? "default" : "sm"} 
          className={`${isMobile ? 'w-full justify-start' : 'justify-center'} text-sm`}
        >
          <User className="w-4 h-4 mr-2 sm:mr-0" />
          <span className="sm:hidden">Profile</span>
        </Button>
      </Link>
      {isMobile ? (
        <Button 
          variant="ghost" 
          size="default"
          onClick={onSignOut} 
          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 w-full justify-start text-sm"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>{t("signOut")}</span>
        </Button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onSignOut} 
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 justify-center text-sm"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("signOut")}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default NavigationMenu;
