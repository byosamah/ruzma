
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackBrandingUpdated, trackError } from '@/lib/analytics';
import { brandingService } from '@/services/brandingService';

export const useProfileActions = (user: User | null) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const updateBranding = async (brandingData: any) => {
    if (!user) return false;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('freelancer_branding')
        .upsert({
          user_id: user.id,
          ...brandingData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Track branding update
      trackBrandingUpdated(user.id, 'profile_branding');
      
      toast.success('Branding updated successfully!');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      return true;
    } catch (error: any) {
      trackError('branding_update', error.message, 'useProfileActions');
      toast.error('Failed to update branding');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) return false;
    
    setIsUpdating(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.name,
          email: profileData.email,
          company: profileData.company,
          website: profileData.website,
          bio: profileData.bio,
          currency: profileData.currency,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update branding data
      const brandingError = await brandingService.updateBranding(user.id, {
        freelancer_name: profileData.name,
        freelancer_title: profileData.professionalTitle,
        freelancer_bio: profileData.shortBio,
        primary_color: profileData.primaryColor,
        logo_url: profileData.logoUrl
      });

      if (brandingError.error) throw brandingError.error;

      toast.success('Profile updated successfully!');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      return true;
    } catch (error: any) {
      trackError('profile_update', error.message, 'useProfileActions');
      toast.error('Failed to update profile');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, setFormData: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (currency: string, setFormData: any) => {
    setFormData((prev: any) => ({ ...prev, currency }));
  };

  const handleLogoUpload = (file: File, setFormData: any) => {
    // This is now handled in the BrandingSection component
  };

  const handleSubmit = async (e: React.FormEvent, formData: any) => {
    e.preventDefault();
    await updateProfile(formData);
  };

  return {
    updateBranding,
    updateProfile,
    isUpdating,
    isLoading: isUpdating,
    isSaved,
    handleChange,
    handleCurrencyChange,
    handleLogoUpload,
    handleSubmit
  };
};
