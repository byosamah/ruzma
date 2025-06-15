
import { supabase } from '@/integrations/supabase/client';

interface SendPaymentNotificationParams {
  clientEmail: string;
  projectName: string;
  projectId: string;
  clientToken: string;
  isApproved: boolean;
  milestoneName: string;
}

export const sendPaymentNotification = async (params: SendPaymentNotificationParams) => {
  try {
    const response = await supabase.functions.invoke('send-payment-notification', {
      body: params,
    });

    if (response.error) {
      console.error('Error sending notification:', response.error);
      throw new Error(response.error.message);
    }

    console.log('Notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send payment notification:', error);
    throw error;
  }
};
