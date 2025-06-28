
import { useState, useRef } from 'react';
import { toast } from "sonner";
import { type Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/imageUtils';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { validateFileSecure, rateLimiter } from '@/lib/security/inputSanitization';
import { logSecurityEvent } from '@/lib/authSecurity';

export const useProfilePictureUpload = (
  user: User | null,
  onProfilePictureUpdate: (url: string) => void
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    // Rate limit: max 5 uploads per hour per user
    if (user && !rateLimiter.checkLimit(`profile_upload_${user.id}`, 5, 3600000)) {
      toast.error("Upload limit reached. Please try again later.");
      logSecurityEvent('profile_upload_rate_limit', { userId: user.id });
      return;
    }
    
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enhanced security validation
    const validation = validateFileSecure(file);
    if (!validation.isValid) {
      toast.error(validation.error || "Invalid file");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Additional profile picture specific checks
    if (file.size > 2 * 1024 * 1024) { // 2MB limit for profile pictures
      toast.error("Profile picture must be less than 2MB.");
      logSecurityEvent('profile_picture_size_violation', {
        fileName: file.name,
        size: file.size,
        userId: user?.id
      });
      return;
    }

    // Check if it's actually an image by trying to load it
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Image loaded successfully, proceed with cropping
        setImageToCrop(event.target?.result as string);
        logSecurityEvent('profile_picture_upload_started', {
          fileName: file.name,
          fileSize: file.size,
          imageWidth: img.width,
          imageHeight: img.height,
          userId: user?.id
        });
      };
      img.onerror = () => {
        toast.error("Invalid image file.");
        logSecurityEvent('invalid_image_file', {
          fileName: file.name,
          userId: user?.id
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      toast.error("Error reading file.");
      logSecurityEvent('file_read_error', {
        fileName: file.name,
        userId: user?.id
      });
    };
    reader.readAsDataURL(file);
  };

  const onCropSave = async () => {
    if (!croppedAreaPixels || !imageToCrop || !user) return;
    
    setIsUploading(true);
    
    try {
      console.log('Starting secure crop and upload process...');
      
      // Get cropped image as blob
      const croppedImageDataUrl = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Convert data URL to blob
      const response = await fetch(croppedImageDataUrl);
      const blob = await response.blob();
      
      // Additional security: Verify blob is actually an image
      if (!blob.type.startsWith('image/')) {
        throw new Error('Invalid image data');
      }
      
      // Create form data with security headers
      const formData = new FormData();
      formData.append('file', blob, 'profile-picture.webp');

      // Get auth session with validation
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        logSecurityEvent('upload_authentication_failed', { userId: user.id });
        throw new Error('Authentication required');
      }

      // Upload with enhanced security monitoring
      const uploadResponse = await fetch(`https://***REMOVED***.supabase.co/functions/v1/upload-profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'X-Client-Info': 'ruzma-web-app',
        },
        body: formData,
      });

      const result = await uploadResponse.json();
      
      if (!uploadResponse.ok) {
        logSecurityEvent('profile_upload_failed', {
          userId: user.id,
          error: result.error,
          status: uploadResponse.status
        });
        throw new Error(result.error || 'Upload failed');
      }

      console.log('Secure upload successful:', result.url);
      
      // Log successful upload
      logSecurityEvent('profile_picture_upload_success', {
        userId: user.id,
        newAvatarUrl: result.url.substring(0, 50) + '...'
      });
      
      // Update local state immediately
      onProfilePictureUpdate(result.url);
      
      toast.success("Profile picture updated successfully!");
      
    } catch (error) {
      console.error('Error in secure onCropSave:', error);
      logSecurityEvent('profile_upload_error', {
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error(error instanceof Error ? error.message : "Failed to update profile picture");
    } finally {
      setIsUploading(false);
      setImageToCrop(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onCropCancel = () => {
    setImageToCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    logSecurityEvent('profile_picture_upload_cancelled', { userId: user?.id });
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
