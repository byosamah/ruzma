
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import NavigationMenu from './NavigationMenu';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Notification } from '@/types/notifications';
import { UserProfile } from '@/types/profile';
import { useT } from '@/lib/i18n';

interface NotificationData {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

interface MobileMenuProps {
  mobileMenuOpen: boolean;
  onToggle: () => void;
  user: User | null;
  userProfile: UserProfile | null;
  isActive: (path: string) => boolean;
  shouldShowUpgradeButton: boolean;
  onSignOut: () => void;
  notificationsData?: NotificationData;
}

const MobileMenu = ({
  mobileMenuOpen,
  onToggle,
  user,
  userProfile,
  isActive,
  shouldShowUpgradeButton,
  onSignOut,
  notificationsData
}) => {
  const t = useT();
  if (!user) return null;

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <NotificationBell user={user} notificationsData={notificationsData} />
      
      <Sheet open={mobileMenuOpen} onOpenChange={onToggle}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 touch-manipulation min-h-[44px] min-w-[44px]">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 sm:w-96 max-w-[90vw]">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg text-left">{t('menu')}</SheetTitle>
            <SheetDescription className="text-left">
              Navigate through your dashboard and manage your projects
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <NavigationMenu
              user={user}
              userProfile={userProfile}
              isActive={isActive}
              isMobile={true}
              shouldShowUpgradeButton={shouldShowUpgradeButton}
              onSignOut={onSignOut}
              onMenuClick={onToggle}
              notificationsData={notificationsData}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenu;
