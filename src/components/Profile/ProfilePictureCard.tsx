
import React, { Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Lazy load the ImageCropperDialog to reduce bundle size
const ImageCropperDialog = lazy(() => 
  import('@/components/ImageCropperDialog').then(module => ({
    default: module.ImageCropperDialog
  }))
);
import { ProfileAvatar } from './ProfileAvatar';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { useProfilePictureManager } from '@/hooks/profile/useProfilePictureManager';
import { useT } from '@/lib/i18n';
import { User } from '@supabase/supabase-js';

interface ProfilePictureCardProps {
  profilePicture: string | null;
  userName: string;
  user: User | null;
  onProfilePictureUpdate: (url: string) => void;
}

export const ProfilePictureCard = ({
  profilePicture,
  userName,
  user,
  onProfilePictureUpdate,
}: ProfilePictureCardProps) => {
  const t = useT();
  
  const {
    imageToCrop,
    croppedAreaPixels,
    setCroppedAreaPixels,
    isUploading,
    handleFileSelect,
    uploadProfilePicture,
    cancelCrop,
  } = useProfilePictureManager({
    user,
    onSuccess: onProfilePictureUpdate,
  });

  return (
    <>
      <Card className="border-gray-200 shadow-none bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-gray-900">
            {t('profilePicture')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 pt-0">
          <ProfileAvatar
            src={profilePicture}
            alt={userName}
            fallbackText={userName?.charAt(0).toUpperCase() || 'U'}
            size="md"
          />
          
          <ProfilePictureUpload
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
          />
        </CardContent>
      </Card>

      {imageToCrop && (
        <Suspense fallback={
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        }>
          <ImageCropperDialog
            image={imageToCrop}
            onCropComplete={setCroppedAreaPixels}
            onSave={uploadProfilePicture}
            onClose={cancelCrop}
          />
        </Suspense>
      )}
    </>
  );
};
