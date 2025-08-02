import { Notification } from '@/types/notification';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface NotificationFilters {
  type?: string | null;
  read?: boolean | null;
  priority?: 'high' | 'medium' | 'low' | null;
  dateRange?: { start?: string; end?: string } | null;
}

export interface NotificationListOptions extends NotificationFilters {
  page?: number;
  limit?: number;
}

export interface NotificationResult {
  data?: Notification;
  error?: string;
}

export interface NotificationListResult {
  data?: Notification[];
  total?: number;
  error?: string;
}

export interface NotificationSubscriptionCallbacks {
  onInsert?: (notification: Notification) => void;
  onUpdate?: (notification: Notification) => void;
  onDelete?: (notification: Notification) => void;
}

export interface INotificationService {
  // CRUD operations
  create(data: Partial<Notification>): Promise<NotificationResult>;
  get(id: string): Promise<NotificationResult>;
  list(options?: NotificationListOptions): Promise<NotificationListResult>;
  update(id: string, data: Partial<Notification>): Promise<NotificationResult>;
  delete(id: string): Promise<{ error?: string }>;
  
  // Notification-specific operations
  markAsRead(id: string): Promise<NotificationResult>;
  markAllAsRead(userId: string): Promise<{ error?: string }>;
  deleteAll(userId: string): Promise<{ error?: string }>;
  
  // Bulk operations
  markMultipleAsRead(ids: string[]): Promise<{ error?: string }>;
  deleteMultiple(ids: string[]): Promise<{ error?: string }>;
  
  // Statistics
  getUnreadCount(userId: string): Promise<{ data?: number; error?: string }>;
  
  // Real-time subscriptions
  subscribe(
    userId: string, 
    callbacks: NotificationSubscriptionCallbacks
  ): Promise<RealtimeChannel>;
  unsubscribe(channel: RealtimeChannel): void;
  
  // System notifications
  createSystemNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    priority?: 'high' | 'medium' | 'low'
  ): Promise<NotificationResult>;
}