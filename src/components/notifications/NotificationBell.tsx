
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationList } from './NotificationList';
import { User } from '@supabase/supabase-js';

interface NotificationBellProps {
  user: User | null;
  notificationsData?: {
    notifications: any[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
  };
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
  user, 
  notificationsData 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!user || !notificationsData) return null;

  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = notificationsData;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <NotificationList
          notifications={notifications}
          loading={loading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={() => setIsOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
