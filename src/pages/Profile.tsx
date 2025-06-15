
import React from 'react';
import Layout from '@/components/Layout';
import { ImageCropperDialog } from '@/components/ImageCropperDialog';
import { ProfilePictureCard } from '@/components/Profile/ProfilePictureCard';
import { PersonalInformationForm } from '@/components/Profile/PersonalInformationForm';
import { AccountSettingsCard } from '@/components/Profile/AccountSettingsCard';
import { useProfile } from '@/hooks/useProfile';

const Profile = () => {
  const {
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
  } = useProfile();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Profile Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account information and preferences</p>
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
            onFormSubmit={handleSubmit}
            onCancel={() => navigate('/dashboard')}
            onCurrencyChange={handleCurrencyChange}
          />
        </div>

        <AccountSettingsCard />
      </div>
    </Layout>
  );
};

export default Profile;
