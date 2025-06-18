
import { supabase } from '@/integrations/supabase/client';

interface SendClientLinkParams {
  clientEmail: string;
  projectName: string;
  freelancerName: string;
  clientToken: string;
}

export const sendClientLink = async (params: SendClientLinkParams) => {
  try {
    const response = await supabase.functions.invoke('send-client-link', {
      body: params,
    });

    if (response.error) {
      console.error('Error sending client link:', response.error);
      throw new Error(response.error.message);
    }

    console.log('Client link sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send client link:', error);
    throw error;
  }
};
