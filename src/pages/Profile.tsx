import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { toast } from "sonner";
import { type Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/imageUtils';
import { ImageCropperDialog } from '@/components/ImageCropperDialog';
import { ProfilePictureCard } from '@/components/Profile/ProfilePictureCard';
import { PersonalInformationForm } from '@/components/Profile/PersonalInformationForm';
import { AccountSettingsCard } from '@/components/Profile/AccountSettingsCard';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user, profile, loading: authLoading, refreshProfile } = useSupabaseAuth();
  const { t } = useTranslation();
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
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.full_name || '',
        email: user?.email || '',
        company: profile.company || '',
        website: profile.website || '',
        bio: profile.bio || '',
        currency: profile.currency || 'USD'
      });
      setProfilePicture(profile.avatar_url || null);
    }
  }, [profile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setIsSaved(false);
  };

  const handleCurrencyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      currency: value
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
      refreshProfile();
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

  // NOTE: This only updates the local image preview. 
  // Saving the image to Supabase Storage is a next step.
  const onCropSave = async () => {
    if (croppedAreaPixels && imageToCrop) {
        try {
            const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
            setProfilePicture(croppedImage);
            
            toast.success("Profile picture updated locally! Save your profile to make it permanent.");
        } catch (error) {
            console.error(error);
            toast.error("There was an error cropping the image.");
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

  if (authLoading || !profile) {
    return <div className="flex justify-center items-center h-screen">{t('profile.loading')}</div>;
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{t('profile.title')}</h1>
          <p className="text-slate-600 mt-2">{t('profile.subtitle')}</p>
        </div>

        <ImageCropperDialog
          image={imageToCrop}
          onCropComplete={setCroppedAreaPixels}
          onSave={onCropSave}
          onClose={onCropCancel}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ProfilePictureCard
            profilePicture={profilePicture}
            userName={formData.name}
            onUploadClick={handleUploadClick}
            onFileChange={handleFileChange}
            fileInputRef={fileInputRef}
          />
          <PersonalInformationForm
            formData={formData}
            isLoading={isLoading}
            isSaved={isSaved}
            onFormChange={handleChange}
            onCurrencyChange={handleCurrencyChange}
            onFormSubmit={handleSubmit}
            onCancel={() => navigate('/dashboard')}
          />
        </div>

        <AccountSettingsCard />
      </div>
    </Layout>
  );
};

export default Profile;
