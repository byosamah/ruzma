
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useT } from '@/lib/i18n';

interface ProfilePictureCardProps {
  profilePicture: string | null;
  userName: string;
  isUploading: boolean;
  onUploadClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const ProfilePictureCard = ({
  profilePicture,
  userName,
  isUploading,
  onUploadClick,
  onFileChange,
  fileInputRef,
}: ProfilePictureCardProps) => {
  const t = useT();

  return (
    <Card className="border-gray-200 shadow-none bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-gray-900">{t('profilePicture')}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4 pt-0">
        <Avatar className="w-24 h-24 mx-auto rounded-full">
          {profilePicture && (
            <AvatarImage 
              src={profilePicture}
              alt={userName}
              className="object-cover w-full h-full rounded-full"
            />
          )}
          <AvatarFallback className="bg-gray-100 text-gray-600 text-xl font-medium rounded-full">
            {userName?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
          accept="image/png,image/jpeg,image/webp,image/gif"
        />
        
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onUploadClick}
            disabled={isUploading}
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {t('uploadPhoto')}
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500">
          PNG, JPEG, WebP, GIF up to 5MB
        </p>
      </CardContent>
    </Card>
  );
};
