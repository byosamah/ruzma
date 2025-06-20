
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FreelancerBranding, BrandingFormData, defaultBranding } from '@/types/branding';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const useBranding = (user: User | null) => {
  const [branding, setBranding] = useState<FreelancerBranding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    fetchBranding();
  }, [user]);

  const fetchBranding = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('freelancer_branding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching branding:', error);
        toast.error('Failed to load branding settings');
        return;
      }

      setBranding(data || {
        user_id: user.id,
        ...defaultBranding,
      } as FreelancerBranding);
    } catch (error) {
      console.error('Error fetching branding:', error);
      toast.error('Failed to load branding settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveBranding = async (formData: BrandingFormData): Promise<boolean> => {
    if (!user) return false;

    setIsSaving(true);
    try {
      const brandingData = {
        user_id: user.id,
        ...formData,
      };

      let result;
      if (branding?.id) {
        result = await supabase
          .from('freelancer_branding')
          .update(brandingData)
          .eq('id', branding.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('freelancer_branding')
          .insert(brandingData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving branding:', result.error);
        toast.error('Failed to save branding settings');
        return false;
      }

      setBranding(result.data);
      toast.success('Branding settings saved successfully!');
      return true;
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error('Failed to save branding settings');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        toast.error('Failed to upload logo');
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('branding')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
      return null;
    }
  };

  return {
    branding,
    isLoading,
    isSaving,
    saveBranding,
    uploadLogo,
    refetch: fetchBranding,
  };
};
