
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
        return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'deadline_warning':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'project_limit':
        return <FolderX className="h-4 w-4 text-red-600" />;
      case 'storage_limit':
        return <HardDrive className="h-4 w-4 text-red-600" />;
      default:
        return <Dot className="h-4 w-4" />;
    }
  };

  const getBackgroundColor = () => {
    if (notification.is_read) return 'bg-transparent';
    
    switch (notification.type) {
      case 'payment_proof':
        return 'bg-green-50 hover:bg-green-100';
      case 'deadline_warning':
        return 'bg-orange-50 hover:bg-orange-100';
      case 'project_limit':
      case 'storage_limit':
        return 'bg-red-50 hover:bg-red-100';
      default:
        return 'bg-blue-50 hover:bg-blue-100';
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg cursor-pointer transition-colors",
        getBackgroundColor(),
        notification.is_read ? "opacity-70" : "opacity-100"
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};
