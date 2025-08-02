import { StateCreator } from 'zustand';
import { NotificationAPI } from '@/lib/api/notifications';
import { Notification } from '@/types/notification';
import { RealtimeChannel } from '@supabase/supabase-js';

const notificationAPI = new NotificationAPI();

export interface NotificationFilters {
  type: string | null;
  read: boolean | null;
  priority: 'high' | 'medium' | 'low' | null;
  dateRange: { start?: string; end?: string } | null;
}

export interface NotificationSlice {
  // State
  notifications: Notification[];
  unreadCount: number;
  filters: NotificationFilters;
  isLoading: boolean;
  error: string | null;
  subscription: RealtimeChannel | null;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  setFilters: (filters: Partial<NotificationFilters>) => void;
  resetFilters: () => void;
  
  // API operations
  fetchNotifications: (page?: number, pageSize?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<{ error?: string }>;
  markAllAsRead: () => Promise<{ error?: string }>;
  deleteNotification: (id: string) => Promise<{ error?: string }>;
  clearAll: () => Promise<{ error?: string }>;
  
  // Real-time
  subscribeToNotifications: (userId: string) => Promise<void>;
  unsubscribeFromNotifications: () => void;
  
  // Computed values
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: string) => Notification[];
  getHighPriorityNotifications: () => Notification[];
}

const defaultFilters: NotificationFilters = {
  type: null,
  read: null,
  priority: null,
  dateRange: null
};

export const createNotificationSlice: StateCreator<NotificationSlice> = (set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  filters: defaultFilters,
  isLoading: false,
  error: null,
  subscription: null,
  
  // Actions
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.read).length;
    set({ notifications, unreadCount });
  },
  
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1
    }));
    
    // Play notification sound if enabled
    const preferences = (window as any).store?.getState()?.preferences;
    if (preferences?.soundEnabled && !notification.read) {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(() => {});
    }
    
    // Show browser notification if enabled
    if (preferences?.showNotifications && !notification.read && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon.png'
        });
      }
    }
  },
  
  updateNotification: (id, updates) => {
    set((state) => {
      const newNotifications = state.notifications.map(n =>
        n.id === id ? { ...n, ...updates } : n
      );
      const unreadCount = newNotifications.filter(n => !n.read).length;
      return { notifications: newNotifications, unreadCount };
    });
  },
  
  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === id);
      const newNotifications = state.notifications.filter(n => n.id !== id);
      const unreadCount = notification?.read 
        ? state.unreadCount 
        : state.unreadCount - 1;
      return { notifications: newNotifications, unreadCount };
    });
  },
  
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }));
  },
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  // API operations
  fetchNotifications: async (page = 1, pageSize = 20) => {
    set({ isLoading: true, error: null });
    
    try {
      const { filters } = get();
      const result = await notificationAPI.list({
        page,
        limit: pageSize,
        type: filters.type,
        read: filters.read,
        priority: filters.priority,
        start_date: filters.dateRange?.start,
        end_date: filters.dateRange?.end
      });
      
      if (result.error) throw new Error(result.error);
      
      const notifications = result.data || [];
      const unreadCount = notifications.filter(n => !n.read).length;
      
      set({
        notifications,
        unreadCount,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },
  
  markAsRead: async (id) => {
    const notification = get().notifications.find(n => n.id === id);
    if (!notification || notification.read) return {};
    
    // Optimistic update
    get().updateNotification(id, { read: true });
    
    try {
      const result = await notificationAPI.markAsRead(id);
      
      if (result.error) {
        // Revert on error
        get().updateNotification(id, { read: false });
        throw new Error(result.error);
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  },
  
  markAllAsRead: async () => {
    const unreadIds = get().notifications
      .filter(n => !n.read)
      .map(n => n.id);
    
    if (unreadIds.length === 0) return {};
    
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));
    
    try {
      const result = await notificationAPI.markAllAsRead();
      
      if (result.error) {
        // Revert on error
        await get().fetchNotifications();
        throw new Error(result.error);
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  },
  
  deleteNotification: async (id) => {
    const notification = get().notifications.find(n => n.id === id);
    if (!notification) return {};
    
    // Optimistic update
    get().removeNotification(id);
    
    try {
      const result = await notificationAPI.delete(id);
      
      if (result.error) {
        // Revert on error
        get().addNotification(notification);
        throw new Error(result.error);
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  },
  
  clearAll: async () => {
    const previousNotifications = get().notifications;
    
    // Optimistic update
    set({ notifications: [], unreadCount: 0 });
    
    try {
      const result = await notificationAPI.deleteAll();
      
      if (result.error) {
        // Revert on error
        set({
          notifications: previousNotifications,
          unreadCount: previousNotifications.filter(n => !n.read).length
        });
        throw new Error(result.error);
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  },
  
  // Real-time
  subscribeToNotifications: async (userId) => {
    // Unsubscribe from existing subscription
    get().unsubscribeFromNotifications();
    
    const subscription = await notificationAPI.subscribe(userId, {
      onInsert: (notification) => {
        get().addNotification(notification);
      },
      onUpdate: (notification) => {
        get().updateNotification(notification.id, notification);
      },
      onDelete: (notification) => {
        get().removeNotification(notification.id);
      }
    });
    
    set({ subscription });
  },
  
  unsubscribeFromNotifications: () => {
    const { subscription } = get();
    if (subscription) {
      notificationAPI.unsubscribe(subscription);
      set({ subscription: null });
    }
  },
  
  // Computed values
  getUnreadNotifications: () => {
    return get().notifications.filter(n => !n.read);
  },
  
  getNotificationsByType: (type) => {
    return get().notifications.filter(n => n.type === type);
  },
  
  getHighPriorityNotifications: () => {
    return get().notifications.filter(n => n.priority === 'high' && !n.read);
  }
});