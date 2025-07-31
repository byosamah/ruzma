
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
// Icons replaced with emojis
import { useT } from '@/lib/i18n';

interface ProfilePictureUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  acceptedFormats?: string;
}

export const ProfilePictureUpload = ({ 
  onFileSelect, 
  isUploading,
  acceptedFormats = "image/png,image/jpeg,image/webp,image/gif"
}: ProfilePictureUploadProps) => {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={acceptedFormats}
      />
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleUploadClick}
        disabled={isUploading}
        className="border-gray-200 text-gray-600 hover:bg-gray-50"
      >
        {isUploading ? (
          <>
            <span className="text-lg mr-2 animate-spin">🔄</span>
            {t('uploading')}...
          </>
        ) : (
          <>
            <span className="text-lg mr-2">📤</span>
            {t('uploadPhoto')}
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 mt-2">
        PNG, JPEG, WebP, GIF up to 5MB
      </p>
    </>
  );
};
