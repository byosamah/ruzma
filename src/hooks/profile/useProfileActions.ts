
import { AppError } from '@/types/common';
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackBrandingUpdated, trackError } from '@/lib/analytics';
import { brandingService } from '@/services/brandingService';

import { FreelancerBranding } from '@/types/branding';

interface BrandingUpdateData {
  freelancer_name?: string;
  freelancer_title?: string;
  freelancer_bio?: string;
  primary_color?: string;
  logo_url?: string;
}

interface ProfileUpdateData {
  name: string;
  email: string;
  company: string;
  website: string;
  bio: string;
  currency: string;
  professionalTitle?: string;
  shortBio?: string;
  primaryColor?: string;
  logoUrl?: string;
}

export const useProfileActions = (user: User | null) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const updateBranding = async (brandingData: BrandingUpdateData) => {
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
    } catch (error: unknown) {
      const appError = error as AppError;
      trackError('branding_update', appError.message, 'useProfileActions');
      toast.error('Failed to update branding');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateProfile = async (profileData: ProfileUpdateData) => {
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
    } catch (error: unknown) {
      const appError = error as AppError;
      trackError('profile_update', appError.message, 'useProfileActions');
      toast.error('Failed to update profile');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = <T extends Record<string, any>>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, 
    setFormData: React.Dispatch<React.SetStateAction<T>>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: T) => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = <T extends Record<string, any>>(
    currency: string, 
    setFormData: React.Dispatch<React.SetStateAction<T>>
  ) => {
    setFormData((prev: T) => ({ ...prev, currency }));
  };

  const handleLogoUpload = <T extends Record<string, any>>(
    file: File, 
    setFormData: React.Dispatch<React.SetStateAction<T>>
  ) => {
    // This is now handled in the BrandingSection component
  };

  const handleSubmit = async (e: React.FormEvent, formData: ProfileUpdateData) => {
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
