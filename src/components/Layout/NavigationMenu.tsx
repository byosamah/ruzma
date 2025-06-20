
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, User, LogOut, Stars } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useT } from '@/lib/i18n';

interface NavigationMenuProps {
  user: any;
  userProfile: any;
  isActive: (path: string) => boolean;
  isMobile: boolean;
  shouldShowUpgradeButton: boolean;
  onSignOut: () => void;
  onMenuClick: () => void;
  notificationsData?: any;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  user,
  userProfile,
  isActive,
  isMobile,
  shouldShowUpgradeButton,
  onSignOut,
  onMenuClick,
  notificationsData
}) => {
  const navigate = useNavigate();
  const t = useT();

  if (!user) {
    return null;
  }

  const menuItems = [
    { path: '/dashboard', label: t('dashboard'), icon: Home },
    { path: '/profile', label: t('profile'), icon: User },
  ];

  if (isMobile) {
    return (
      <div className="flex flex-col space-y-3 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              className="justify-start w-full h-12 text-base"
              onClick={() => {
                navigate(item.path);
                onMenuClick();
              }}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Button>
          );
        })}
        
        {shouldShowUpgradeButton && (
          <Button
            className="justify-start w-full h-12 bg-brand-yellow hover:bg-brand-yellow/90 text-brand-black font-semibold shadow-md border-0 text-base"
            onClick={() => {
              navigate('/plans');
              onMenuClick();
            }}
          >
            <Stars className="w-5 h-5 mr-3" />
            {t('upgrade')}
          </Button>
        )}
        
        <Button
          variant="ghost"
          className="justify-start w-full h-12 text-red-600 hover:text-red-700 hover:bg-red-50 text-base"
          onClick={onSignOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          {t('signOut')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 lg:space-x-3">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.path}
            variant={isActive(item.path) ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate(item.path)}
            className="flex items-center gap-1 px-2 lg:px-3"
          >
            <Icon className="w-4 h-4" />
            <span className="hidden lg:inline text-sm">{item.label}</span>
          </Button>
        );
      })}
      
      <NotificationBell user={user} notificationsData={notificationsData} />
      
      {shouldShowUpgradeButton && (
        <Button
          size="sm"
          className="bg-brand-yellow hover:bg-brand-yellow/90 text-brand-black font-semibold shadow-md border-0 px-3 lg:px-4"
          onClick={() => navigate('/plans')}
        >
          <Stars className="w-4 h-4 mr-1" />
          <span className="hidden lg:inline text-sm">{t('upgrade')}</span>
          <span className="lg:hidden text-sm">{t('upgrade')}</span>
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 lg:px-3"
        onClick={onSignOut}
      >
        <LogOut className="w-4 h-4 lg:mr-1" />
        <span className="hidden lg:inline text-sm">{t('signOut')}</span>
      </Button>
    </div>
  );
};

export default NavigationMenu;
