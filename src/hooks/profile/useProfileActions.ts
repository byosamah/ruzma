
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackBrandingUpdated, trackError } from '@/lib/analytics';

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
      console.error('Error updating branding:', error);
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
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
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
    // Handle logo upload logic here
    console.log('Logo upload:', file);
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
