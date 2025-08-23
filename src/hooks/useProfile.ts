
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/core/useAuth';
import { useDashboardActions } from '@/hooks/dashboard/useDashboardActions';
import { useProfileInfo } from './profile/useProfileInfo';
import { useProfileActions } from './profile/useProfileActions';

export const useProfile = (user?: User | null) => {
  const { navigate } = useLanguageNavigation();
  const { user: authUser } = useAuth();
  const { handleSignOut } = useDashboardActions(() => Promise.resolve(true));
  
  // Use provided user or fallback to auth user
  const currentUser = user || authUser;
  
  const { formData, setFormData, profilePicture, setProfilePicture } = useProfileInfo(currentUser);
  const { isLoading, isSaved, handleChange, handleCurrencyChange, handleLogoUpload, handleSubmit } = useProfileActions(currentUser);

  const wrappedHandleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleChange(e, setFormData);
  };

  const wrappedHandleCurrencyChange = (currency: string) => {
    handleCurrencyChange(currency, setFormData);
  };

  const wrappedHandleCountryChange = (countryCode: string) => {
    setFormData(prev => ({ ...prev, country: countryCode }));
  };

  const wrappedHandleLogoUpload = (file: File) => {
    handleLogoUpload(file, setFormData);
  };

  const wrappedHandleSubmit = (e: React.FormEvent) => {
    handleSubmit(e, formData);
  };

  const updateProfilePicture = (newPictureUrl: string) => {
    setProfilePicture(newPictureUrl);
  };

  return {
    user: currentUser,
    formData,
    profilePicture,
    isLoading,
    isSaved,
    navigate,
    handleChange: wrappedHandleChange,
    handleCurrencyChange: wrappedHandleCurrencyChange,
    handleCountryChange: wrappedHandleCountryChange,
    handleLogoUpload: wrappedHandleLogoUpload,
    handleSubmit: wrappedHandleSubmit,
    updateProfilePicture,
    handleSignOut,
  };
};
