
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useT } from '@/lib/i18n';
import { AuthenticatedUser, UserProfile } from '@/types/profile';

interface NavigationMenuProps {
  user: AuthenticatedUser;
  userProfile: UserProfile;
  isActive: (path: string) => boolean;
  isMobile: boolean;
  shouldShowUpgradeButton: boolean;
  onSignOut: () => void;
  onMenuClick: () => void;
  notificationsData?: {
    notifications: unknown[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
  };
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
      <div className="flex flex-col space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              className="justify-start w-full min-h-[44px] touch-manipulation text-left"
              onClick={() => {
                navigate(item.path);
                onMenuClick();
              }}
            >
              <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Button>
          );
        })}
        
        {shouldShowUpgradeButton && (
          <Button 
            className="justify-start w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold min-h-[44px] touch-manipulation text-left"
            onClick={() => {
              navigate('/plans');
              onMenuClick();
            }}
          >
            <span className="text-sm">{t('upgrade')}</span>
          </Button>
        )}
        
        <div className="pt-2 border-t border-gray-200">
          <Button 
            variant="ghost" 
            className="justify-start w-full text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[44px] touch-manipulation text-left" 
            onClick={onSignOut}
          >
            <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
            <span className="text-sm">{t('signOut')}</span>
          </Button>
        </div>
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
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Icon className="w-4 h-4" />
            <span className="hidden lg:inline">{item.label}</span>
          </Button>
        );
      })}
      
      <NotificationBell user={user} notificationsData={notificationsData as any} />
      
      {shouldShowUpgradeButton && (
        <Button 
          size="sm" 
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 font-semibold"
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
