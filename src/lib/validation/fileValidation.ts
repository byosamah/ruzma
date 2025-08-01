import { securityMonitor } from '../security/monitoring';

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    securityMonitor.monitorValidationFailure(file.name, 'file_size', {
      size: file.size,
      maxAllowed: MAX_FILE_SIZE,
      filename: file.name
    });
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    securityMonitor.monitorValidationFailure(file.name, 'file_type', {
      type: file.type,
      allowedTypes: ALLOWED_FILE_TYPES,
      filename: file.name
    });
    return { isValid: false, error: 'File type not allowed. Please upload JPG, PNG, GIF, WebP, or PDF files only.' };
  }

  // Additional check: ensure file extension matches MIME type
  const fileExtension = file.name.toLowerCase().split('.').pop();
  const mimeTypeExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/jpg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf']
  };

  const expectedExtensions = mimeTypeExtensions[file.type] || [];
  if (fileExtension && !expectedExtensions.includes(fileExtension)) {
    securityMonitor.monitorValidationFailure(file.name, 'file_extension_mismatch', {
      extension: fileExtension,
      mimeType: file.type,
      expectedExtensions,
      filename: file.name
    });
    return { isValid: false, error: 'File extension does not match file type' };
  }

  // Check for suspicious file extensions in filename
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
  const hasSuspiciousExtension = suspiciousExtensions.some(ext => 
    file.name.toLowerCase().includes(ext)
  );

  if (hasSuspiciousExtension) {
    securityMonitor.monitorSuspiciousActivity('suspicious_file_extension', {
      filename: file.name,
      detectedExtensions: suspiciousExtensions.filter(ext => 
        file.name.toLowerCase().includes(ext)
      )
    });
    return { isValid: false, error: 'File contains suspicious extensions' };
  }

  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.name);
  if (sanitizedFilename !== file.name) {
    securityMonitor.logEvent('filename_sanitization', {
      original: file.name,
      sanitized: sanitizedFilename
    });
  }

  return { isValid: true };
};

export const sanitizeFilename = (filename: string): string => {
  // Remove or replace invalid characters
  const sanitized = filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // Replace invalid chars with underscore
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255); // Limit length

  // Remove leading/trailing special characters
  return sanitized.replace(/^[._-]+|[._-]+$/g, '');
};