
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Notification } from '@/types/notifications';
import { toast } from 'sonner';

export const useNotifications = (user: User | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, type, is_read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        toast.error('Failed to fetch notifications');
        return;
      }

      // Type assertion to ensure proper typing
      const typedNotifications = (data || []).map(notification => ({
        ...notification,
        type: notification.type as 'payment_proof' | 'deadline_warning' | 'project_limit' | 'storage_limit'
      })) as Notification[];

      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to mark notification as read');
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        toast.error('Failed to mark all notifications as read');
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (user && (window.location.hostname === 'app.ruzma.co' || window.location.hostname.includes('vercel.app'))) {
      // Only enable real-time subscriptions in production to avoid WebSocket connection issues in development
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            try {
              const newNotification = {
                ...payload.new,
                type: payload.new.type as 'payment_proof' | 'deadline_warning' | 'project_limit' | 'storage_limit'
              } as Notification;
              
              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => prev + 1);
              
              // Show toast notification
              toast.info(newNotification.title, {
                description: newNotification.message,
              });
            } catch (error) {
              // Silently handle real-time notification parsing errors
              console.debug('Real-time notification parsing error:', error);
            }
          }
        )
        .subscribe((status, err) => {
          if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            // Silently handle WebSocket connection errors
            console.debug('WebSocket connection issue, falling back to manual refresh:', status, err);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
