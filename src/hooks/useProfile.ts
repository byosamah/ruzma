
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useDashboardActions } from '@/hooks/dashboard/useDashboardActions';
import { useProfileInfo } from './profile/useProfileInfo';
import { useProfileActions } from './profile/useProfileActions';
import { useProfilePictureUpload } from './profile/useProfilePictureUpload';

export const useProfile = (user?: User | null) => {
  const navigate = useNavigate();
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

  const wrappedHandleLogoUpload = (file: File) => {
    handleLogoUpload(file, setFormData);
  };

  const wrappedHandleSubmit = (e: React.FormEvent) => {
    handleSubmit(e, formData);
  };

  const updateProfilePicture = (newPictureUrl: string) => {
    console.log('updateProfilePicture called with:', newPictureUrl);
    setProfilePicture(newPictureUrl);
  };

  // New profile picture upload functionality
  const {
    fileInputRef,
    imageToCrop,
    croppedAreaPixels,
    setCroppedAreaPixels,
    isUploading,
    handleUploadClick,
    handleFileChange,
    onCropSave,
    onCropCancel,
  } = useProfilePictureUpload(currentUser, updateProfilePicture);

  return {
    user: currentUser,
    formData,
    profilePicture,
    isLoading,
    isSaved,
    fileInputRef,
    imageToCrop,
    isUploading,
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
    handleSignOut,
  };
};
