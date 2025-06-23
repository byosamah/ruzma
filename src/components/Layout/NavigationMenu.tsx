
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, User, LogOut } from 'lucide-react';
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
    {
      path: '/dashboard',
      label: t('dashboard'),
      icon: Home
    },
    {
      path: '/profile',
      label: t('profile'),
      icon: User
    }
  ];

  if (isMobile) {
    return (
      <div className="flex flex-col space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              className="justify-start w-full"
              onClick={() => {
                navigate(item.path);
                onMenuClick();
              }}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          );
        })}
        
        {shouldShowUpgradeButton && (
          <Button 
            className="justify-start w-full saas-accent-bg hover:bg-orange-600 font-semibold"
            onClick={() => {
              navigate('/plans');
              onMenuClick();
            }}
          >
            {t('upgrade')}
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          className="justify-start w-full text-red-600 hover:text-red-700 hover:bg-red-50" 
          onClick={onSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('signOut')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.path}
            variant={isActive(item.path) ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate(item.path)}
            className="flex items-center gap-2 text-saas-gray-600 hover:text-saas-gray-900"
          >
            <Icon className="w-4 h-4" />
            <span className="hidden lg:inline">{item.label}</span>
          </Button>
        );
      })}
      
      <NotificationBell user={user} notificationsData={notificationsData} />
      
      {shouldShowUpgradeButton && (
        <Button 
          size="sm" 
          className="saas-accent-bg hover:bg-orange-600 px-4 font-semibold"
          onClick={() => navigate('/plans')}
        >
          {t('upgrade')}
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-red-600 hover:text-red-700 hover:bg-red-50" 
        onClick={onSignOut}
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default NavigationMenu;
