
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import type { InvoiceData, ProfileData, BrandingData } from './types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function fetchInvoiceData(invoiceId: string): Promise<InvoiceData> {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (invoiceError || !invoice) {
    console.error('Error fetching invoice:', invoiceError);
    throw new Error('Invoice not found');
  }

  return invoice;
}

export async function fetchUserProfile(userId: string): Promise<ProfileData | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('currency, full_name, email')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return null;
  }

  return profile;
}

export async function fetchBrandingData(userId: string): Promise<BrandingData | null> {
  const { data: branding, error: brandingError } = await supabase
    .from('freelancer_branding')
    .select('logo_url, freelancer_name, freelancer_title, freelancer_bio')
    .eq('user_id', userId)
    .maybeSingle();

  if (brandingError) {
    console.error('Error fetching branding:', brandingError);
    return null;
  }

  return branding;
}
