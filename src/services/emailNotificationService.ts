/**
 * Email Notification Service
 *
 * This service provides a clean API for triggering email notifications
 * via Supabase Edge Functions. All notifications respect user preferences
 * set in their notification_settings.
 */

import { supabase } from '@/integrations/supabase/client';

interface ProjectUpdateParams {
  projectId: string;
  clientEmail: string;
  updateType: 'status_change' | 'milestone_added' | 'timeline_change' | 'general';
  updateDetails: string;
  language?: 'en' | 'ar';
}

interface PaymentReminderParams {
  milestoneId: string;
  clientEmail: string;
  language?: 'en' | 'ar';
}

interface MilestoneUpdateParams {
  milestoneId: string;
  clientEmail: string;
  oldStatus: 'pending' | 'in_progress' | 'review' | 'completed';
  newStatus: 'pending' | 'in_progress' | 'review' | 'completed';
  message?: string;
  language?: 'en' | 'ar';
}

interface MarketingEmailParams {
  recipientEmail: string;
  recipientName: string;
  promoTitle: string;
  promoDescription: string;
  ctaText: string;
  ctaUrl: string;
  promoImageUrl?: string;
  language?: 'en' | 'ar';
}

/**
 * Email Notification Service Class
 *
 * Provides methods to trigger different types of email notifications.
 * All methods:
 * - Check user notification preferences before sending
 * - Return success/failure status
 * - Log errors for debugging
 */
class EmailNotificationService {
  /**
   * Send a project update notification to the client
   *
   * @param params - Project update parameters
   * @returns Promise with success status and email ID or error
   */
  async sendProjectUpdate(params: ProjectUpdateParams) {
    try {
      const { data, error } = await supabase.functions.invoke('send-project-update', {
        body: params
      });

      if (error) {
        console.error('Failed to send project update email:', error);
        return { success: false, error: error.message };
      }

      return { success: true, emailId: data.emailId };
    } catch (error) {
      console.error('Error invoking send-project-update function:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Send a payment reminder notification to the client
   *
   * @param params - Payment reminder parameters
   * @returns Promise with success status and email ID or error
   */
  async sendPaymentReminder(params: PaymentReminderParams) {
    try {
      const { data, error } = await supabase.functions.invoke('send-payment-reminder', {
        body: params
      });

      if (error) {
        console.error('Failed to send payment reminder email:', error);
        return { success: false, error: error.message };
      }

      return { success: true, emailId: data.emailId };
    } catch (error) {
      console.error('Error invoking send-payment-reminder function:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Send a milestone status update notification to the client
   *
   * @param params - Milestone update parameters
   * @returns Promise with success status and email ID or error
   */
  async sendMilestoneUpdate(params: MilestoneUpdateParams) {
    try {
      const { data, error } = await supabase.functions.invoke('send-milestone-update', {
        body: params
      });

      if (error) {
        console.error('Failed to send milestone update email:', error);
        return { success: false, error: error.message };
      }

      return { success: true, emailId: data.emailId };
    } catch (error) {
      console.error('Error invoking send-milestone-update function:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Send a marketing/promotional email to a user
   *
   * @param params - Marketing email parameters
   * @returns Promise with success status and email ID or error
   */
  async sendMarketingEmail(params: MarketingEmailParams) {
    try {
      const { data, error } = await supabase.functions.invoke('send-marketing-email', {
        body: params
      });

      if (error) {
        console.error('Failed to send marketing email:', error);
        return { success: false, error: error.message };
      }

      return { success: true, emailId: data.emailId };
    } catch (error) {
      console.error('Error invoking send-marketing-email function:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get user's notification preferences
   *
   * @param userId - User ID to fetch preferences for
   * @returns Promise with notification settings object
   */
  async getNotificationPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to fetch notification preferences:', error);
        return null;
      }

      return data?.notification_settings || {
        projectUpdates: true,
        paymentReminders: true,
        milestoneUpdates: true,
        marketing: false
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  /**
   * Update user's notification preferences
   *
   * @param userId - User ID to update preferences for
   * @param preferences - New notification settings
   * @returns Promise with success status
   */
  async updateNotificationPreferences(userId: string, preferences: Record<string, boolean>) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_settings: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Failed to update notification preferences:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}

// Export singleton instance
export const emailNotificationService = new EmailNotificationService();

// Export types for use in other modules
export type {
  ProjectUpdateParams,
  PaymentReminderParams,
  MilestoneUpdateParams,
  MarketingEmailParams
};
