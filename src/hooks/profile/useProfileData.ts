
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { ProfileFormData } from './types';
import { secureFileUpload } from '@/lib/storageeSecurity';

export const useProfileData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    company: '',
    website: '',
    bio: '',
    currency: 'USD',
    professionalTitle: '',
    shortBio: '',
    primaryColor: '#050c1e',
    logoUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      // Fetch profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Fetch branding data for professional title, short bio, color, and logo
      const { data: branding, error: brandingError } = await supabase
        .from('freelancer_branding')
        .select('freelancer_title, freelancer_bio, primary_color, logo_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      }

      if (profile) {
        setFormData({
          name: profile.full_name || '',
          email: profile.email || user.email || '',
          company: profile.company || '',
          website: profile.website || '',
          bio: profile.bio || '',
          currency: profile.currency || 'USD',
          professionalTitle: branding?.freelancer_title || '',
          shortBio: branding?.freelancer_bio || '',
          primaryColor: branding?.primary_color || '#050c1e',
          logoUrl: branding?.logo_url || ''
        });
        setProfilePicture(profile.avatar_url || null);
      } else {
        // No profile exists or there was an error fetching, try to create one.
        // Get currency from user metadata if available
        const userCurrency = user.user_metadata?.currency || 'USD';
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            currency: userCurrency
          })
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating profile:", createError);
          toast.error("Error setting up your profile. Please try refreshing the page.");
        } else if (newProfile) {
          setFormData({
            name: newProfile.full_name || '',
            email: newProfile.email || user.email || '',
            company: newProfile.company || '',
            website: newProfile.website || '',
            bio: newProfile.bio || '',
            currency: newProfile.currency || userCurrency,
            professionalTitle: branding?.freelancer_title || '',
            shortBio: branding?.freelancer_bio || '',
            primaryColor: branding?.primary_color || '#050c1e',
            logoUrl: branding?.logo_url || ''
          });
          setProfilePicture(newProfile.avatar_url || null);
        }
      }
    };
    fetchUserAndProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setIsSaved(false);
  };

  const handleCurrencyChange = (currency: string) => {
    setFormData(prev => ({
      ...prev,
      currency
    }));
    setIsSaved(false);
  };

  const handleLogoUpload = async (file: File) => {
    if (!user) return;

    try {
      const result = await secureFileUpload(
        file,
        'branding-logos',
        user.id,
        user.id
      );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    // Update profile data
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.name,
        email: formData.email,
        company: formData.company,
        website: formData.website,
        bio: formData.bio,
        currency: formData.currency,
      })
      .eq('id', user.id);

    // Update branding data for professional title, short bio, color, and logo
    const { error: brandingError } = await supabase
      .from('freelancer_branding')
      .upsert({
        user_id: user.id,
        freelancer_title: formData.professionalTitle || '',
        freelancer_bio: formData.shortBio || '',
        freelancer_name: formData.name,
        primary_color: formData.primaryColor || '#050c1e',
        secondary_color: '#1D3770',
        logo_url: formData.logoUrl || '',
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      });
    
    setIsLoading(false);

    if (error || brandingError) {
      toast.error(error?.message || brandingError?.message || 'Error updating profile');
    } else {
      setIsSaved(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const updateProfilePicture = (newPictureUrl: string) => {
    setProfilePicture(newPictureUrl);
  };

  return {
    user,
    profilePicture,
    formData,
    isLoading,
    isSaved,
    handleChange,
    handleCurrencyChange,
    handleLogoUpload,
    handleSubmit,
    updateProfilePicture,
  };
};
