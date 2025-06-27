
import React from 'react';
import Layout from '@/components/Layout';
import { ImageCropperDialog } from '@/components/ImageCropperDialog';
import { ProfilePictureCard } from '@/components/Profile/ProfilePictureCard';
import { PersonalInformationForm } from '@/components/Profile/PersonalInformationForm';
import { AccountSettingsCard } from '@/components/Profile/AccountSettingsCard';
import { useProfile } from '@/hooks/useProfile';
import { useT } from '@/lib/i18n';

const Profile = () => {
  const t = useT();
  
  const {
    user,
    profilePicture,
    fileInputRef,
    formData,
    isLoading,
    isSaved,
    imageToCrop,
    isUploading,
    navigate,
    handleChange,
    handleCurrencyChange,
    handleLogoUpload,
    handleSubmit,
    handleUploadClick,
    handleFileChange,
    onCropSave,
    onCropCancel,
    setCroppedAreaPixels,
    handleSignOut
  } = useProfile();

  if (!user) {
    return <div>{t('loading')}</div>;
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-medium text-gray-900">{t('profileSettings')}</h1>
          <p className="text-sm text-gray-500">{t('manageAccountInfo')}</p>
        </div>

        <ImageCropperDialog
          image={imageToCrop}
          onCropComplete={setCroppedAreaPixels}
          onSave={onCropSave}
          onClose={onCropCancel}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProfilePictureCard
            profilePicture={profilePicture}
            userName={formData.name}
            isUploading={isUploading}
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
            onLogoUpload={handleLogoUpload}
          />
        </div>

        <AccountSettingsCard />
      </div>
    </Layout>
  );
};

export default Profile;
