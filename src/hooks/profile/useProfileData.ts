
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { ProfileFormData } from './types';

export const useProfileData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    company: '',
    website: '',
    bio: '',
    currency: 'USD'
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

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
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
          currency: profile.currency || 'USD'
        });
        setProfilePicture(profile.avatar_url || null);
      } else {
        // No profile exists or there was an error fetching, try to create one.
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email
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
            currency: newProfile.currency || 'USD'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

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
    
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
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
    handleSubmit,
    updateProfilePicture,
  };
};
