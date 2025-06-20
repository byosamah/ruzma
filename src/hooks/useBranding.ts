
import { useState, useEffect } from 'react';
import { FreelancerBranding, BrandingFormData, defaultBranding } from '@/types/branding';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { secureFileUpload } from '@/lib/storageeSecurity';

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

      if (error) {
        console.error('Error fetching branding:', error);
      }

      if (data) {
        setBranding(data);
      } else {
        // No branding found, use defaults
        setBranding({
          user_id: user.id,
          ...defaultBranding,
          freelancer_name: user.user_metadata?.full_name || '',
          freelancer_title: 'Professional',
          freelancer_bio: 'Delivering quality work for your projects.',
        } as FreelancerBranding);
      }
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
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('freelancer_branding')
        .upsert(brandingData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving branding:', error);
        toast.error('Failed to save branding settings');
        return false;
      }

      setBranding(data);
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
      const result = await secureFileUpload(
        file,
        'branding-logos',
        user.id,
        user.id
      );

      if (result.success && result.url) {
        return result.url;
      } else {
        toast.error(result.error || 'Failed to upload logo');
        return null;
      }
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
