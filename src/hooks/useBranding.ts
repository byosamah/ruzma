
import { useState, useEffect } from 'react';
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

    // For now, just use default branding until database table is created
    setBranding({
      user_id: user.id,
      ...defaultBranding,
      freelancer_name: 'Freelancer',
      freelancer_title: 'Professional',
      freelancer_bio: 'Delivering quality work for your projects.',
    } as FreelancerBranding);
    setIsLoading(false);
  }, [user]);

  const saveBranding = async (formData: BrandingFormData): Promise<boolean> => {
    if (!user) return false;

    setIsSaving(true);
    try {
      // For now, just update local state until database table is created
      setBranding({
        user_id: user.id,
        ...formData,
      } as FreelancerBranding);
      
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
      // For now, create a temporary URL until storage is set up
      const tempUrl = URL.createObjectURL(file);
      return tempUrl;
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
    refetch: () => {},
  };
};
