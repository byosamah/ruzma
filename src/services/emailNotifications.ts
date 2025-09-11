
import { supabase } from '@/integrations/supabase/client';
import { EnhancedEmailService } from './core/EnhancedEmailService';

interface SendPaymentNotificationParams {
  clientEmail: string;
  projectName: string;
  projectId: string;
  clientToken: string;
  isApproved: boolean;
  milestoneName: string;
  language?: 'en' | 'ar';
}

export const sendPaymentNotification = async (params: SendPaymentNotificationParams) => {
  // Use the new EnhancedEmailService with React Email templates
  const emailService = new EnhancedEmailService(null, {
    useReactEmailTemplates: true, // ✅ ENABLED: Now using server-side React Email templates
    fallbackToEdgeFunctions: true,
    defaultLanguage: params.language || 'en'
  });

  try {
    await emailService.sendPaymentNotification({
      ...params,
      language: params.language || 'en'
    });
    
    return { success: true };
  } catch (error) {
    // Fallback to Edge Function if React Email fails
    console.warn('React Email failed, falling back to Edge Function:', error);
    
    const response = await supabase.functions.invoke('send-payment-notification', {
      body: params,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  }
};
