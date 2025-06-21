
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { useProfileInfo } from './useProfileInfo';
import { useProfileActions } from './useProfileActions';

export const useProfileData = () => {
  const navigate = useNavigate();

  // This hook now delegates to focused hooks instead of handling everything
  const useProfileDataLogic = (user: User | null) => {
    const { formData, setFormData, profilePicture, setProfilePicture } = useProfileInfo(user);
    const { isLoading, isSaved, handleChange, handleCurrencyChange, handleLogoUpload, handleSubmit } = useProfileActions(user);

    const wrappedHandleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleChange(e, setFormData);
    };

    const wrappedHandleCurrencyChange = (currency: string) => {
      handleCurrencyChange(currency, setFormData);
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
      formData,
      profilePicture,
      isLoading,
      isSaved,
      handleChange: wrappedHandleChange,
      handleCurrencyChange: wrappedHandleCurrencyChange,
      handleLogoUpload: wrappedHandleLogoUpload,
      handleSubmit: wrappedHandleSubmit,
      updateProfilePicture,
    };
  };

  return useProfileDataLogic;
};
