import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export const initializeSupabase = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseServiceKey);
};

export const fetchInvoice = async (supabase: any, invoiceId: string) => {
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (error || !invoice) {
    throw new Error('Invoice not found');
  }

  return invoice;
};

export const fetchFreelancerInfo = async (supabase: any, userId: string) => {
  const [brandingResult, profileResult] = await Promise.all([
    supabase
      .from('freelancer_branding')
      .select('freelancer_name')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()
  ]);

  const branding = brandingResult.data;
  const profile = profileResult.data;

  return branding?.freelancer_name || profile?.full_name || 'Your Freelancer';
};