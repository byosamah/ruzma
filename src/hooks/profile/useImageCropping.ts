
import { useState, useRef } from 'react';
import { toast } from "sonner";
import { getCroppedImg } from '@/lib/imageUtils';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useImageCropping = (
  user: User | null,
  onProfilePictureUpdate: (url: string) => void
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("File is too large. Max size is 2MB.");
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
        try {
            const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
            
            const { error } = await supabase
              .from('profiles')
              .update({ avatar_url: croppedImage })
              .eq('id', user.id);

            if (error) throw error;
            
            // Force immediate state update
            onProfilePictureUpdate(croppedImage);
            
            // Force a page refresh to ensure the new image displays
            setTimeout(() => {
              window.location.reload();
            }, 500);
            
            toast.success("Profile picture updated!");
        } catch (error) {
            toast.error("There was an error updating your profile picture.");
        } finally {
            setImageToCrop(null);
            if(fileInputRef.current) {
              fileInputRef.current.value = '';
            }
        }
    }
  };

  const onCropCancel = () => {
    setImageToCrop(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    fileInputRef,
    imageToCrop,
    croppedAreaPixels,
    setCroppedAreaPixels,
    handleUploadClick,
    handleFileChange,
    onCropSave,
    onCropCancel,
  };
};
