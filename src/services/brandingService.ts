
import { supabase } from '@/integrations/supabase/client';
import { secureFileUpload } from '@/lib/storageeSecurity';

export const brandingService = {
  async fetchBranding(userId: string) {
    const { data: branding, error } = await supabase
      .from('freelancer_branding')
      .select('freelancer_title, freelancer_bio, primary_color, logo_url')
      .eq('user_id', userId)
      .maybeSingle();

    return { branding, error };
  },

  async updateBranding(userId: string, brandingData: any) {
    const { error } = await supabase
      .from('freelancer_branding')
      .upsert({
        user_id: userId,
        freelancer_title: brandingData.professionalTitle || '',
        freelancer_bio: brandingData.shortBio || '',
        freelancer_name: brandingData.name,
        primary_color: brandingData.primaryColor || '#050c1e',
        secondary_color: '#1D3770',
        logo_url: brandingData.logoUrl || '',
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      });

    return { error };
  },

  async uploadLogo(file: File, userId: string) {
    const result = await secureFileUpload(
      file,
      'branding-logos',
      userId,
      userId
    );

    return result;
  }
};
