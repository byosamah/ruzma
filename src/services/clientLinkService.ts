
import { supabase } from '@/integrations/supabase/client';
import { EnhancedEmailService } from './core/EnhancedEmailService';

interface SendClientLinkParams {
  clientEmail: string;
  projectName: string;
  freelancerName: string;
  clientToken: string;
  userId?: string;
  language?: 'en' | 'ar';
  inviteMessage?: string;
}

export const sendClientLink = async (params: SendClientLinkParams) => {
  // Use the new EnhancedEmailService with React Email templates
  const emailService = new EnhancedEmailService(null, {
    useReactEmailTemplates: false, // Temporarily disabled due to client-side bundle issues
    fallbackToEdgeFunctions: true,
    defaultLanguage: params.language || 'en'
  });

  try {
    await emailService.sendClientLink({
      ...params,
      language: params.language || 'en'
    });
    
    return { success: true };
  } catch (error) {
    // Fallback to Edge Function if React Email fails
    console.warn('React Email failed, falling back to Edge Function:', error);
    
    const response = await supabase.functions.invoke('send-client-link', {
      body: params,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  }
};
