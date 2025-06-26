
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useProfileInfo } from './profile/useProfileInfo';
import { useProfileActions } from './profile/useProfileActions';
import { useImageCropping } from './profile/useImageCropping';

export const useProfile = (user?: User | null) => {
  const navigate = useNavigate();
  const { user: authUser, handleSignOut: authHandleSignOut } = useAuth();
  
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

  const wrappedHandleLogoUpload = (file: File) => {
    handleLogoUpload(file, setFormData);
  };

  const wrappedHandleSubmit = (e: React.FormEvent) => {
    handleSubmit(e, formData);
  };

  const updateProfilePicture = (newPictureUrl: string) => {
    setProfilePicture(newPictureUrl);
  };

  // Image cropping functionality
  const {
    fileInputRef,
    imageToCrop,
    croppedAreaPixels,
    setCroppedAreaPixels,
    handleUploadClick,
    handleFileChange,
    onCropSave,
    onCropCancel,
  } = useImageCropping(currentUser, updateProfilePicture);

  return {
    user: currentUser,
    formData,
    profilePicture,
    isLoading,
    isSaved,
    fileInputRef,
    imageToCrop,
    navigate,
    handleChange: wrappedHandleChange,
    handleCurrencyChange: wrappedHandleCurrencyChange,
    handleLogoUpload: wrappedHandleLogoUpload,
    handleSubmit: wrappedHandleSubmit,
    updateProfilePicture,
    handleUploadClick,
    handleFileChange,
    onCropSave,
    onCropCancel,
    setCroppedAreaPixels,
    handleSignOut: authHandleSignOut,
  };
};
