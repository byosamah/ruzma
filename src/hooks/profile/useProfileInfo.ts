
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { profileService } from '@/services/profileService';
import { brandingService } from '@/services/brandingService';
import { ProfileFormData } from './types';
import { toast } from 'sonner';
import { fetchExistingProfile, createNewProfile, setProfileFormData } from './utils/profileFetchers';

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
      const { profileData, profileError } = await fetchExistingProfile(user.id);
      const { branding } = await brandingService.fetchBranding(user.id);

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }

      if (profileData) {
        // Handle existing profile
        setFormData(setProfileFormData(profileData, branding, user));
        // Ensure profile picture is set from the fetched data
        setProfilePicture(profileData.avatar_url || null);
      } else {
        // Handle new profile creation
        const userCurrency = user.user_metadata?.currency || 'USD';
        const { newProfile, createError } = await createNewProfile(user, userCurrency);
        
        if (createError) {
          toast.error("Error setting up your profile. Please try refreshing the page.");
        } else if (newProfile) {
          setFormData(setProfileFormData(newProfile, branding, user, userCurrency));
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
