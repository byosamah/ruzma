
import Layout from '@/components/Layout';
import YouTubePopup from '@/components/YouTubePopup';
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
    formData,
    isLoading,
    isSaved,
    navigate,
    handleChange,
    handleCurrencyChange,
    handleCountryChange,
    handleLogoUpload,
    handleSubmit,
    updateProfilePicture,
    handleSignOut
  } = useProfile();

  if (!user) {
    return <div>{t('loading')}</div>;
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-medium text-gray-900">{t('profileSettings')}</h1>
            <YouTubePopup 
              videoId="xlT8TSyGO10"
              buttonText={t('knowMore')}
              buttonVariant="ghost"
              buttonSize="sm"
            />
          </div>
          <p className="text-sm text-gray-500">{t('manageAccountInfo')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProfilePictureCard
            profilePicture={profilePicture}
            userName={formData.name}
            user={user}
            onProfilePictureUpdate={updateProfilePicture}
          />
          <PersonalInformationForm
            formData={formData}
            isLoading={isLoading}
            isSaved={isSaved}
            onFormChange={handleChange}
            onFormSubmit={handleSubmit}
            onCancel={() => navigate('/dashboard')}
            onCurrencyChange={handleCurrencyChange}
            onCountryChange={handleCountryChange}
            onLogoUpload={handleLogoUpload}
          />
        </div>

        <AccountSettingsCard />
      </div>
    </Layout>
  );
};

export default Profile;
