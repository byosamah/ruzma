
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
        freelancer_title: brandingData.professionalTitle || brandingData.freelancer_title || '',
        freelancer_bio: brandingData.shortBio || brandingData.freelancer_bio || '',
        freelancer_name: brandingData.name || brandingData.freelancer_name || '',
        primary_color: brandingData.primaryColor || brandingData.primary_color || '#050c1e',
        secondary_color: '#1D3770',
        logo_url: brandingData.logoUrl || brandingData.logo_url || '',
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      });

    return { error };
  },

  async uploadLogo(file: File, userId: string) {
    try {
      const result = await secureFileUpload(
        file,
        'branding-logos',
        userId,
        userId
      );

      return result;
    } catch (error) {
      console.error('Error in brandingService.uploadLogo:', error);
      return { success: false, error: 'Failed to upload logo' };
    }
  }
};
