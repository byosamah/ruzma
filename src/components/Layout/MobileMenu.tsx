
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { 
  Menu, 
  User, 
  LogOut, 
  BarChart3, 
  Crown, 
  FolderOpen, 
  FileText 
} from 'lucide-react';
import { useT } from '@/lib/i18n';

interface MobileMenuProps {
  mobileMenuOpen: boolean;
  onToggle: () => void;
  user: any;
  userProfile: any;
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

  if (!user) {
    return (
      <Button variant="ghost" size="icon">
        <Menu className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Notification Bell for Mobile */}
      <NotificationBell user={user} />
      
      <Sheet open={mobileMenuOpen} onOpenChange={onToggle}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <div className="flex flex-col h-full">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-6">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userProfile?.avatar_url} alt="Avatar" />
                <AvatarFallback className="text-sm">
                  {user?.email ? getInitials(user.email) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
                <Badge variant="outline" className="text-xs px-1 py-0 mt-1">
                  {userProfile?.user_type === 'pro' ? 'Pro' : 
                   userProfile?.user_type === 'plus' ? 'Plus' : 'Free'}
                </Badge>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Navigation Items */}
            <div className="flex-1 space-y-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={onToggle}>
                  <Button
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              ))}

              <Separator className="my-4" />

              <Link to="/profile" onClick={onToggle}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-3 h-5 w-5" />
                  {t('profile')}
                </Button>
              </Link>

              {shouldShowUpgradeButton && (
                <Link to="/plans" onClick={onToggle}>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <Crown className="mr-3 h-5 w-5" />
                    {t('upgrade')}
                  </Button>
                </Link>
              )}
            </div>

            {/* Sign Out */}
            <div className="mt-auto pt-4">
              <Separator className="mb-4" />
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onSignOut}
              >
                <LogOut className="mr-3 h-5 w-5" />
                {t('signOut')}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenu;
