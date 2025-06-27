
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

  const handleLogoUpload = async (file: File, setFormData: any) => {
    if (!user) {
      toast.error('User not found');
      return;
    }

    try {
      // Create a unique filename
      const fileName = `${user.id}/brand-logo-${Date.now()}.${file.name.split('.').pop()}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload brand logo');
        return;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(fileName);

      // Update form data with the new logo URL
      setFormData((prev: any) => ({ ...prev, logoUrl: publicUrl }));
      
      toast.success('Brand logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading brand logo:', error);
      toast.error('Failed to upload brand logo');
    }
  };

  const handleSubmit = async (e: React.FormEvent, formData: any) => {
    e.preventDefault();
    
    // Split the form data into profile and branding data
    const profileData = {
      full_name: formData.name,
      email: formData.email,
      company: formData.company,
      website: formData.website,
      bio: formData.bio,
      currency: formData.currency,
    };

    const brandingData = {
      freelancer_name: formData.name,
      freelancer_title: formData.professionalTitle || '',
      freelancer_bio: formData.shortBio || '',
      primary_color: formData.primaryColor || '#050c1e',
      logo_url: formData.logoUrl || '',
    };

    // Update both profile and branding data
    const profileSuccess = await updateProfile(profileData);
    const brandingSuccess = await updateBranding(brandingData);

    if (profileSuccess && brandingSuccess) {
      toast.success('All changes saved successfully!');
    } else if (profileSuccess || brandingSuccess) {
      toast.success('Some changes saved successfully');
    }
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
