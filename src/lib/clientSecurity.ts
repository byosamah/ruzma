
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from './authSecurity';

export interface ClientProjectAccess {
  isValid: boolean;
  project?: any;
  error?: string;
}

// Secure client project access validation
export const validateClientProjectAccess = async (token: string): Promise<ClientProjectAccess> => {
  try {
    logSecurityEvent('client_project_access_attempt', { token: token.substring(0, 8) + '...' });

    // Validate token format
    if (!token || typeof token !== 'string') {
      logSecurityEvent('client_project_access_invalid_token', { reason: 'invalid_format' });
      return { isValid: false, error: 'Invalid token format' };
    }

    // Call the secure edge function instead of direct database access
    const { data, error } = await supabase.functions.invoke('get-client-project', {
      body: { token }
    });

    if (error) {
      logSecurityEvent('client_project_access_failed', { 
        error: error.message,
        token: token.substring(0, 8) + '...'
      });
      return { isValid: false, error: 'Project not found or access denied' };
    }

    if (!data) {
      logSecurityEvent('client_project_access_not_found', { 
        token: token.substring(0, 8) + '...'
      });
      return { isValid: false, error: 'Project not found' };
    }

    logSecurityEvent('client_project_access_success', { 
      projectId: data.id,
      token: token.substring(0, 8) + '...'
    });

    return { isValid: true, project: data };
  } catch (error) {
    console.error('Client project validation error:', error);
    logSecurityEvent('client_project_access_error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      token: token.substring(0, 8) + '...'
    });
    return { isValid: false, error: 'Access validation failed' };
  }
};

// Secure file upload validation
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'image/webp'
  ];

  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    logSecurityEvent('file_upload_size_violation', { 
      fileName: file.name,
      size: file.size,
      maxSize: MAX_FILE_SIZE
    });
    return { isValid: false, error: 'File size exceeds 5MB limit' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    logSecurityEvent('file_upload_type_violation', { 
      fileName: file.name,
      fileType: file.type,
      allowedTypes: ALLOWED_TYPES
    });
    return { isValid: false, error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` };
  }

  // Additional security: Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const typeExtensionMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf']
  };

  const validExtensions = typeExtensionMap[file.type] || [];
  if (extension && !validExtensions.includes(extension)) {
    logSecurityEvent('file_upload_extension_mismatch', { 
      fileName: file.name,
      fileType: file.type,
      extension
    });
    return { isValid: false, error: 'File extension does not match file type' };
  }

  return { isValid: true };
};

// Sanitize filename for secure storage
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .substring(0, 100); // Limit length
};
