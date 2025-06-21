
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { profileService } from '@/services/profileService';
import { brandingService } from '@/services/brandingService';
import { ProfileFormData } from './types';
import { toast } from 'sonner';

export const useProfileActions = (user: User | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setIsSaved(false);
  };

  const handleCurrencyChange = (
    currency: string,
    setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>
  ) => {
    setFormData(prev => ({
      ...prev,
      currency
    }));
    setIsSaved(false);
  };

  const handleLogoUpload = async (
    file: File,
    setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>
  ) => {
    if (!user) return;

    try {
      const result = await brandingService.uploadLogo(file, user.id);

      if (result.success && result.url) {
        setFormData(prev => ({
          ...prev,
          logoUrl: result.url
        }));
        setIsSaved(false);
        toast.success('Logo uploaded successfully!');
      } else {
        toast.error(result.error || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  const handleSubmit = async (e: React.FormEvent, formData: ProfileFormData) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    const profileResult = await profileService.updateProfile(user.id, formData);
    const brandingResult = await brandingService.updateBranding(user.id, formData);
    
    setIsLoading(false);

    if (profileResult.error || brandingResult.error) {
      toast.error(profileResult.error?.message || brandingResult.error?.message || 'Error updating profile');
    } else {
      setIsSaved(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return {
    isLoading,
    isSaved,
    handleChange,
    handleCurrencyChange,
    handleLogoUpload,
    handleSubmit
  };
};
