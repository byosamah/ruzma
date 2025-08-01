import { supabase } from '@/integrations/supabase/client';
import { securityMonitor } from './monitoring';

// Client Project Access Interface
export interface ClientProjectAccess {
  isValid: boolean;
  project?: any;
  error?: string;
}

// Validate client project access using token
export const validateClientProjectAccess = async (token: string): Promise<ClientProjectAccess> => {
  try {
    console.log('Validating client project access...');
    
    if (!token) {
      return {
        isValid: false,
        error: 'Access token is required'
      };
    }

    // Use Supabase function to validate token and get project data
    const { data, error } = await supabase.functions.invoke('get-client-project', {
      body: { token }
    });

    if (error) {
      console.error('Token validation error:', error);
      securityMonitor.monitorPermissionViolation('client_project', 'access_attempt', {
        token: token.substring(0, 8) + '...',
        error: error.message
      });
      return {
        isValid: false,
        error: 'Invalid or expired access link'
      };
    }

    if (!data || !data.project) {
      securityMonitor.monitorPermissionViolation('client_project', 'access_attempt', {
        token: token.substring(0, 8) + '...',
        reason: 'No project data returned'
      });
      return {
        isValid: false,
        error: 'Project not found or access denied'
      };
    }

    // Log successful access
    securityMonitor.logEvent('client_project_access', {
      projectId: data.project.id,
      success: true
    });

    return {
      isValid: true,
      project: data.project
    };

  } catch (error: any) {
    console.error('Client project access validation failed:', error);
    securityMonitor.monitorPermissionViolation('client_project', 'access_error', {
      token: token.substring(0, 8) + '...',
      error: error.message
    });
    
    return {
      isValid: false,
      error: 'Access validation failed'
    };
  }
};

// File upload validation with security checks
export const validateFileUploadSecurity = (file: File): { isValid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf'
  ];

  // File size check
  if (file.size > MAX_FILE_SIZE) {
    securityMonitor.monitorValidationFailure(file.name, 'file_size_exceeded', {
      size: file.size,
      maxAllowed: MAX_FILE_SIZE
    });
    return {
      isValid: false,
      error: 'File size exceeds 5MB limit'
    };
  }

  // File type check
  if (!ALLOWED_TYPES.includes(file.type)) {
    securityMonitor.monitorValidationFailure(file.name, 'invalid_file_type', {
      type: file.type,
      allowedTypes: ALLOWED_TYPES
    });
    return {
      isValid: false,
      error: 'File type not allowed'
    };
  }

  // Extension vs MIME type consistency check
  const extension = file.name.toLowerCase().split('.').pop();
  const mimeExtensionMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/jpg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf']
  };

  const expectedExtensions = mimeExtensionMap[file.type];
  if (extension && expectedExtensions && !expectedExtensions.includes(extension)) {
    securityMonitor.monitorSuspiciousActivity('file_extension_mismatch', {
      filename: file.name,
      extension,
      mimeType: file.type,
      expectedExtensions
    });
    return {
      isValid: false,
      error: 'File extension does not match file type'
    };
  }

  return { isValid: true };
};

// Filename sanitization
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars
    .replace(/_{2,}/g, '_') // Remove duplicate underscores
    .substring(0, 255); // Limit length
};