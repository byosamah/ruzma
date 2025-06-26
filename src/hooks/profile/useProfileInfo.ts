
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { profileService } from '@/services/profileService';
import { brandingService } from '@/services/brandingService';
import { ProfileFormData } from './types';
import { toast } from 'sonner';

export const useProfileInfo = (user: User | null) => {
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
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      const { profile, error } = await profileService.fetchProfile(user.id);
      const { branding } = await brandingService.fetchBranding(user.id);

      if (error) {
        console.error("Error fetching profile:", error);
      }

      if (profile) {
        setFormData({
          name: profile.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
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
        // Create new profile with signup name
        const userCurrency = user.user_metadata?.currency || 'USD';
        const signupName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        
        const { profile: newProfile, error: createError } = await profileService.createProfile(user, userCurrency);
        
        if (createError) {
          console.error("Error creating profile:", createError);
          toast.error("Error setting up your profile. Please try refreshing the page.");
        } else if (newProfile) {
          setFormData({
            name: newProfile.full_name || signupName,
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

    fetchProfileData();
  }, [user]);

  return {
    formData,
    setFormData,
    profilePicture,
    setProfilePicture
  };
};
