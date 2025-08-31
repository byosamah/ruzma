
import { supabase } from '@/integrations/supabase/client';


interface BrandingUpdateData {
  professionalTitle?: string;
  freelancer_title?: string;
  shortBio?: string;
  freelancer_bio?: string;
  name?: string;
  freelancer_name?: string;
  primaryColor?: string;
  primary_color?: string;
  logoUrl?: string;
  logo_url?: string;
}

export const brandingService = {
  async fetchBranding(userId: string) {
    const { data: branding, error } = await supabase
      .from('freelancer_branding')
      .select('freelancer_title, freelancer_bio, primary_color, logo_url')
      .eq('user_id', userId)
      .maybeSingle();

    return { branding, error };
  },

  async updateBranding(userId: string, brandingData: BrandingUpdateData) {
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
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('branding-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return { success: false, error: 'Failed to upload logo' };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('branding-logos')
        .getPublicUrl(filePath);

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      return { success: false, error: 'Failed to upload logo' };
    }
  }
};
