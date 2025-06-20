
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  CreditCard, 
  Clock, 
  FolderX, 
  HardDrive,
  Dot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification } from '@/types/notifications';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'payment_proof':
        return <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />;
      case 'deadline_warning':
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />;
      case 'project_limit':
        return <FolderX className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />;
      case 'storage_limit':
        return <HardDrive className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />;
      default:
        return <Dot className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  const getBackgroundColor = () => {
    if (notification.is_read) return 'bg-transparent';
    
    switch (notification.type) {
      case 'payment_proof':
        return 'bg-green-50 hover:bg-green-100 active:bg-green-100';
      case 'deadline_warning':
        return 'bg-orange-50 hover:bg-orange-100 active:bg-orange-100';
      case 'project_limit':
      case 'storage_limit':
        return 'bg-red-50 hover:bg-red-100 active:bg-red-100';
      default:
        return 'bg-blue-50 hover:bg-blue-100 active:bg-blue-100';
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 sm:p-4 rounded-lg cursor-pointer transition-colors touch-manipulation",
        "min-h-[80px] sm:min-h-[60px]", // Better touch targets on mobile
        getBackgroundColor(),
        notification.is_read ? "opacity-70" : "opacity-100"
      )}
    >
      <div className="flex items-start space-x-3 sm:space-x-4">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 pr-2">
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-sm sm:text-sm text-gray-600 mt-1 sm:mt-2 line-clamp-3">
            {notification.message}
          </p>
          <p className="text-xs sm:text-xs text-gray-400 mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};
