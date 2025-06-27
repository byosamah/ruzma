
import { useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import getCroppedImg from '@/lib/cropImage';

export const useImageCropping = (user: User | null, updateProfilePicture: (url: string) => void) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const onCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels || !user) return;

    try {
      const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Convert blob to file
      const file = new File([croppedImageBlob], 'profile-picture.jpg', { type: 'image/jpeg' });
      
      // Upload to Supabase Storage
      const fileName = `${user.id}/profile-picture-${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload profile picture');
        return;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        toast.error('Failed to update profile picture');
        return;
      }

      // Update local state
      updateProfilePicture(publicUrl);
      setImageToCrop(null);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error('Failed to update profile picture');
    }
  };

  const onCropCancel = () => {
    setImageToCrop(null);
    setCroppedAreaPixels(null);
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
