
import { supabase } from '@/integrations/supabase/client';

interface SendClientLinkParams {
  clientEmail: string;
  projectName: string;
  freelancerName: string;
  clientToken: string;
  userId?: string;
}

export const sendClientLink = async (params: SendClientLinkParams) => {
  const response = await supabase.functions.invoke('send-client-link', {
    body: params,
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};
