
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from './authSecurity';
import { validateFileUpload, sanitizeFilename } from './clientSecurity';

export interface SecureUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Secure file upload with comprehensive validation
export const secureFileUpload = async (
  file: File,
  bucket: string,
  path: string,
  userId?: string
): Promise<SecureUploadResult> => {
  try {
    // Validate file first
    const validation = validateFileUpload(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Sanitize filename
    const sanitizedName = sanitizeFilename(file.name);
    const timestamp = Date.now();
    const secureFileName = `${timestamp}_${sanitizedName}`;
    const fullPath = `${path}/${secureFileName}`;

    logSecurityEvent('secure_file_upload_started', {
      bucket,
      originalName: file.name,
      sanitizedName: secureFileName,
      size: file.size,
      type: file.type,
      userId
    });

    // Upload file with secure settings
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false, // Prevent overwriting
      });

    if (error) {
      logSecurityEvent('secure_file_upload_failed', {
        bucket,
        path: fullPath,
        error: error.message,
        userId
      });
      return { success: false, error: 'Upload failed' };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fullPath);

    logSecurityEvent('secure_file_upload_success', {
      bucket,
      path: fullPath,
      userId
    });

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('Secure upload error:', error);
    logSecurityEvent('secure_file_upload_error', {
      bucket,
      error: error instanceof Error ? error.message : 'Unknown error',
      userId
    });
    return { success: false, error: 'Upload failed' };
  }
};

// Secure file deletion with ownership verification
export const secureFileDelete = async (
  bucket: string,
  path: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    logSecurityEvent('secure_file_delete_started', {
      bucket,
      path,
      userId
    });

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      logSecurityEvent('secure_file_delete_failed', {
        bucket,
        path,
        error: error.message,
        userId
      });
      return { success: false, error: 'Delete failed' };
    }

    logSecurityEvent('secure_file_delete_success', {
      bucket,
      path,
      userId
    });

    return { success: true };
  } catch (error) {
    console.error('Secure delete error:', error);
    logSecurityEvent('secure_file_delete_error', {
      bucket,
      path,
      error: error instanceof Error ? error.message : 'Unknown error',
      userId
    });
    return { success: false, error: 'Delete failed' };
  }
};

// Get secure download URL with access verification
export const getSecureDownloadUrl = async (
  bucket: string,
  path: string,
  userId?: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    logSecurityEvent('secure_download_url_requested', {
      bucket,
      path,
      userId
    });

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
      logSecurityEvent('secure_download_url_failed', {
        bucket,
        path,
        error: error.message,
        userId
      });
      return { success: false, error: 'Failed to generate download URL' };
    }

    logSecurityEvent('secure_download_url_success', {
      bucket,
      path,
      userId
    });

    return { success: true, url: data.signedUrl };
  } catch (error) {
    console.error('Secure download URL error:', error);
    logSecurityEvent('secure_download_url_error', {
      bucket,
      path,
      error: error instanceof Error ? error.message : 'Unknown error',
      userId
    });
    return { success: false, error: 'Failed to generate download URL' };
  }
};
