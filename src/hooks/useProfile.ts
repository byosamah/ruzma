
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { type Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/imageUtils';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    website: '',
    bio: '',
    currency: 'USD'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
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
          email: user.email || '',
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
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          })
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating profile:", createError);
          toast.error("Error setting up your profile. Please try refreshing the page.");
        } else if (newProfile) {
          setFormData({
            name: newProfile.full_name || '',
            email: user.email || '',
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("File is too large. Max size is 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropSave = async () => {
    if (croppedAreaPixels && imageToCrop && user) {
        try {
            const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
            
            const { error } = await supabase
              .from('profiles')
              .update({ avatar_url: croppedImage })
              .eq('id', user.id);

            if (error) throw error;
            
            setProfilePicture(croppedImage);
            toast.success("Profile picture updated!");
        } catch (error) {
            console.error(error);
            toast.error("There was an error updating your profile picture.");
        } finally {
            setImageToCrop(null);
            if(fileInputRef.current) {
              fileInputRef.current.value = '';
            }
        }
    }
  };

  const onCropCancel = () => {
    setImageToCrop(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return {
    user,
    profilePicture,
    fileInputRef,
    formData,
    isLoading,
    isSaved,
    imageToCrop,
    navigate,
    handleChange,
    handleCurrencyChange,
    handleSubmit,
    handleUploadClick,
    handleFileChange,
    onCropSave,
    onCropCancel,
    setCroppedAreaPixels,
    handleSignOut,
  };
};
