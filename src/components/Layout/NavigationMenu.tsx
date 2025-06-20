
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, User, CreditCard, LogOut } from 'lucide-react';
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
    { path: '/dashboard', label: t('dashboard'), icon: BarChart3 },
    { path: '/profile', label: t('profile'), icon: User },
    { path: '/plans', label: t('plans'), icon: CreditCard },
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
            variant="outline"
            className="justify-start w-full border-orange-200 text-orange-600 hover:bg-orange-50"
            onClick={() => {
              navigate('/plans');
              onMenuClick();
            }}
          >
            <CreditCard className="w-4 h-4 mr-2" />
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
    <div className="flex items-center space-x-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.path}
            variant={isActive(item.path) ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate(item.path)}
            className="flex items-center gap-1"
          >
            <Icon className="w-4 h-4" />
            <span className="hidden lg:inline">{item.label}</span>
          </Button>
        );
      })}
      
      <NotificationBell user={user} notificationsData={notificationsData} />
      
      {shouldShowUpgradeButton && (
        <Button
          variant="outline"
          size="sm"
          className="border-orange-200 text-orange-600 hover:bg-orange-50"
          onClick={() => navigate('/plans')}
        >
          <CreditCard className="w-4 h-4 lg:mr-1" />
          <span className="hidden lg:inline">{t('upgrade')}</span>
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={onSignOut}
      >
        <LogOut className="w-4 h-4 lg:mr-1" />
        <span className="hidden lg:inline">{t('signOut')}</span>
      </Button>
    </div>
  );
};

export default NavigationMenu;
