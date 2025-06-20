
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  BarChart3, 
  Crown, 
  FolderOpen, 
  Settings,
  Palette,
  FileText 
} from 'lucide-react';
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
  const navigate = useNavigate();
  const t = useT();

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: FolderOpen },
    { path: '/analytics', label: t('analytics'), icon: BarChart3 },
    { path: '/templates', label: t('templates'), icon: FileText },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (isMobile) {
    return null; // Mobile menu is handled separately
  }

  return (
    <>
      {user && (
        <>
          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={onMenuClick}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Upgrade Button */}
          {shouldShowUpgradeButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/plans')}
              className="border-orange-200 text-orange-700 hover:bg-orange-50 flex items-center gap-1"
            >
              <Crown className="w-4 h-4" />
              <span className="hidden lg:inline">{t('upgrade')}</span>
            </Button>
          )}

          {/* Notification Bell */}
          <NotificationBell user={user} />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.avatar_url} alt="Avatar" />
                  <AvatarFallback className="text-xs">
                    {user?.email ? getInitials(user.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">
                    {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {userProfile?.user_type === 'pro' ? 'Pro' : 
                       userProfile?.user_type === 'plus' ? 'Plus' : 'Free'}
                    </Badge>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>{t('profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/plans')}>
                <Crown className="mr-2 h-4 w-4" />
                <span>{t('plans')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('signOut')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </>
  );
};

export default NavigationMenu;
