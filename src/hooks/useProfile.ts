
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { useProfileInfo } from './profile/useProfileInfo';
import { useProfileActions } from './profile/useProfileActions';

export const useProfile = (user: User | null) => {
  const navigate = useNavigate();
  
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
