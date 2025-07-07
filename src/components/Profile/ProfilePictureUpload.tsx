
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
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
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('uploading')}...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
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
