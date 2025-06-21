
import { useNavigate } from 'react-router-dom';
import { useProfileData } from './profile/useProfileData';
import { useImageCropping } from './profile/useImageCropping';
import { handleSignOut as signOut } from './profile/authUtils';
import { useAuth } from './dashboard/useAuth';

export const useProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const useProfileDataLogic = useProfileData();
  
  const {
    formData,
    profilePicture,
    isLoading,
    isSaved,
    handleChange,
    handleCurrencyChange,
    handleLogoUpload,
    handleSubmit,
    updateProfilePicture,
  } = useProfileDataLogic(user);

  const {
    fileInputRef,
    imageToCrop,
    croppedAreaPixels,
    setCroppedAreaPixels,
    handleUploadClick,
    handleFileChange,
    onCropSave,
    onCropCancel,
  } = useImageCropping(user, updateProfilePicture);

  const handleSignOut = () => signOut(navigate);

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
    handleLogoUpload,
    handleSubmit,
    handleUploadClick,
    handleFileChange,
    onCropSave,
    onCropCancel,
    setCroppedAreaPixels,
    handleSignOut,
  };
};
