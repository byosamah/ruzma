import { BaseAPI } from './base';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  user_id: string;
  type: 'payment_proof' | 'deadline_warning' | 'project_limit' | 'storage_limit';
  title: string;
  message: string;
  related_project_id?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export class NotificationAPI extends BaseAPI<Notification> {
  constructor() {
    super('notifications', '*, projects(id, name)');
  }

  /**
   * Get unread notifications
   */
  async getUnread(userId: string) {
    return this.findAll({ user_id: userId, is_read: false });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string) {
    return this.update(id, { is_read: true });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    return this.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true }
    );
  }

  /**
   * Create payment proof notification
   */
  async createPaymentProofNotification(data: {
    user_id: string;
    project_id: string;
    project_name: string;
    milestone_title: string;
  }) {
    return this.create({
      user_id: data.user_id,
      type: 'payment_proof',
      title: 'Payment Proof Submitted',
      message: `Payment proof has been submitted for milestone "${data.milestone_title}" in project "${data.project_name}"`,
      related_project_id: data.project_id,
      is_read: false
    });
  }

  /**
   * Create deadline warning notification
   */
  async createDeadlineWarning(data: {
    user_id: string;
    project_id: string;
    project_name: string;
    milestone_title: string;
    days_until_deadline: number;
  }) {
    return this.create({
      user_id: data.user_id,
      type: 'deadline_warning',
      title: 'Deadline Approaching',
      message: `Milestone "${data.milestone_title}" in project "${data.project_name}" is due in ${data.days_until_deadline} day(s)`,
      related_project_id: data.project_id,
      is_read: false
    });
  }

  /**
   * Create limit warning notification
   */
  async createLimitWarning(data: {
    user_id: string;
    type: 'project_limit' | 'storage_limit';
    current: number;
    limit: number;
  }) {
    const isProjectLimit = data.type === 'project_limit';
    const percentage = Math.round((data.current / data.limit) * 100);
    
    return this.create({
      user_id: data.user_id,
      type: data.type,
      title: isProjectLimit ? 'Project Limit Warning' : 'Storage Limit Warning',
      message: isProjectLimit 
        ? `You have used ${data.current} of ${data.limit} projects (${percentage}%)`
        : `You have used ${percentage}% of your storage limit`,
      is_read: false
    });
  }

  /**
   * Get notification statistics
   */
  async getStatistics(userId: string) {
    const notifications = await this.findAll({ user_id: userId });
    
    if (notifications.error || !notifications.data) {
      return { error: notifications.error, data: undefined };
    }

    const stats = {
      total: notifications.data.length,
      unread: 0,
      byType: {
        payment_proof: 0,
        deadline_warning: 0,
        project_limit: 0,
        storage_limit: 0
      }
    };

    notifications.data.forEach(notification => {
      if (!notification.is_read) stats.unread++;
      stats.byType[notification.type]++;
    });

    return { data: stats, error: undefined };
  }

  /**
   * Clean old notifications (older than 30 days)
   */
  async cleanOldNotifications(userId: string, daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    return this.executeRaw(
      (supabase) => supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId)
        .eq('is_read', true)
        .lt('created_at', cutoffDate.toISOString())
    );
  }

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  }
}