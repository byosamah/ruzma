
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useT } from '@/lib/i18n';

interface ProfilePictureCardProps {
  profilePicture: string | null;
  userName: string;
  onUploadClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const ProfilePictureCard = ({
  profilePicture,
  userName,
  onUploadClick,
  onFileChange,
  fileInputRef,
}: ProfilePictureCardProps) => {
  const t = useT();

  // Debug logs
  console.log('ProfilePictureCard render - profilePicture:', profilePicture);
  console.log('ProfilePictureCard render - userName:', userName);

  // Create a unique key to force Avatar re-render when image changes
  const avatarKey = profilePicture ? `avatar-${profilePicture.substring(0, 50)}` : 'avatar-empty';

  return (
    <Card className="border-gray-200 shadow-none bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-gray-900">{t('profilePicture')}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4 pt-0">
        <Avatar key={avatarKey} className="w-24 h-24 mx-auto border border-gray-100">
          {profilePicture && (
            <AvatarImage 
              src={profilePicture} 
              alt={userName}
              onLoad={() => console.log('Avatar image loaded successfully')}
              onError={(e) => {
                console.log('Avatar image failed to load:', e);
                console.log('Failed image src:', profilePicture);
              }}
            />
          )}
          <AvatarFallback className="bg-gray-100 text-gray-600 text-xl font-medium">
            {userName?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
        />
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onUploadClick}
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            {t('uploadPhoto')}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          {t('photoFormat')}
        </p>
      </CardContent>
    </Card>
  );
};
