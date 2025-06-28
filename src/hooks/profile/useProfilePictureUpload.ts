
import { useState, useRef } from 'react';
import { toast } from "sonner";
import { type Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/imageUtils';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useProfilePictureUpload = (
  user: User | null,
  onProfilePictureUpdate: (url: string) => void
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File is too large. Max size is 5MB.");
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropSave = async () => {
    if (croppedAreaPixels && imageToCrop && user) {
      setIsUploading(true);
      
      try {
        console.log('Starting crop and upload process...');
        
        // Get cropped image as blob
        const croppedImageDataUrl = await getCroppedImg(imageToCrop, croppedAreaPixels);
        
        // Convert data URL to blob
        const response = await fetch(croppedImageDataUrl);
        const blob = await response.blob();
        
        // Create form data
        const formData = new FormData();
        formData.append('file', blob, 'profile-picture.webp');

        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated');
        }

        // Upload via edge function using the correct Supabase URL
        const uploadResponse = await fetch(`https://***REMOVED***.supabase.co/functions/v1/upload-profile-picture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        });

        const result = await uploadResponse.json();
        
        if (!uploadResponse.ok) {
          throw new Error(result.error || 'Upload failed');
        }

        console.log('Upload successful:', result.url);
        
        // Update local state immediately
        onProfilePictureUpdate(result.url);
        
        toast.success("Profile picture updated successfully!");
        
      } catch (error) {
        console.error('Error in onCropSave:', error);
        toast.error(error instanceof Error ? error.message : "Failed to update profile picture");
      } finally {
        setIsUploading(false);
        setImageToCrop(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const onCropCancel = () => {
    setImageToCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    fileInputRef,
    imageToCrop,
    croppedAreaPixels,
    setCroppedAreaPixels,
    isUploading,
    handleUploadClick,
    handleFileChange,
    onCropSave,
    onCropCancel,
  };
};
