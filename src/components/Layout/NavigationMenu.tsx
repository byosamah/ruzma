
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
      <>
        <Link to="/login" onClick={onMenuClick}>
          <Button variant="ghost" size={isMobile ? "default" : "sm"} className="w-full sm:w-auto">{t("login")}</Button>
        </Link>
        <Link to="/signup" onClick={onMenuClick}>
          <Button size={isMobile ? "default" : "sm"} variant="secondary" className="w-full sm:w-auto">{t("signUp")}</Button>
        </Link>
      </>
    );
  }

  return (
    <>
      {shouldShowUpgradeButton && (
        <Link to="/plans" onClick={onMenuClick}>
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"}
            className="bg-gradient-to-r from-brand-yellow to-yellow-500 text-brand-black border-0 hover:from-yellow-400 hover:to-yellow-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold w-full sm:w-auto"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Upgrade
          </Button>
        </Link>
      )}
      <Link to="/dashboard" onClick={onMenuClick}>
        <Button variant={isActive('/dashboard') ? 'secondary' : 'ghost'} size={isMobile ? "default" : "sm"} className="w-full sm:w-auto justify-start sm:justify-center">
          <Briefcase className="w-4 h-4 mr-2" />
          {t("dashboard")}
        </Button>
      </Link>
      <Link to="/profile" onClick={onMenuClick}>
        <Button variant={isActive('/profile') ? 'secondary' : 'ghost'} size={isMobile ? "default" : "sm"} className="w-full sm:w-auto justify-start sm:justify-center">
          <User className="w-4 h-4 mr-2 sm:mr-0" />
          <span className="sm:hidden">Profile</span>
        </Button>
      </Link>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size={isMobile ? "default" : "sm"}
            onClick={onSignOut} 
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 w-full sm:w-auto justify-start sm:justify-center"
          >
            <LogOut className="w-4 h-4 mr-2 sm:mr-0" />
            <span className="sm:hidden">Sign Out</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("signOut")}</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
};

export default NavigationMenu;
