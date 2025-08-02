/**
 * File handling utilities
 */

/**
 * Allowed file types by category
 */
export const fileTypes = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  archive: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
};

/**
 * File extensions map
 */
export const fileExtensions: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'application/zip': '.zip'
};

/**
 * Get file extension from filename or MIME type
 */
export const getFileExtension = (filename: string, mimeType?: string): string => {
  // Try to get from filename first
  const lastDot = filename.lastIndexOf('.');
  if (lastDot !== -1) {
    return filename.substring(lastDot).toLowerCase();
  }
  
  // Fallback to MIME type
  if (mimeType && fileExtensions[mimeType]) {
    return fileExtensions[mimeType];
  }
  
  return '';
};

/**
 * Get file name without extension
 */
export const getFileNameWithoutExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(0, lastDot) : filename;
};

/**
 * Sanitize filename for storage
 */
export const sanitizeFileName = (filename: string): string => {
  // Remove or replace invalid characters
  let sanitized = filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')  // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_')            // Replace multiple underscores with single
    .replace(/^_|_$/g, '');            // Remove leading/trailing underscores
  
  // Ensure filename is not empty
  if (!sanitized) {
    sanitized = 'file';
  }
  
  // Limit length
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const extension = getFileExtension(sanitized);
    const nameWithoutExt = getFileNameWithoutExtension(sanitized);
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 1);
    sanitized = truncatedName + extension;
  }
  
  return sanitized;
};

/**
 * Generate unique filename
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);
  const nameWithoutExt = getFileNameWithoutExtension(originalName);
  const sanitizedName = sanitizeFileName(nameWithoutExt);
  
  return `${sanitizedName}_${timestamp}_${randomString}${extension}`;
};

/**
 * Check if file type is allowed
 */
export const isFileTypeAllowed = (
  file: File,
  allowedTypes: string[] | 'image' | 'document' | 'video' | 'audio' | 'archive'
): boolean => {
  const types = Array.isArray(allowedTypes) 
    ? allowedTypes 
    : fileTypes[allowedTypes] || [];
  
  return types.includes(file.type);
};

/**
 * Validate file size
 */
export const validateFileSize = (
  file: File,
  maxSizeInMB: number
): { valid: boolean; error?: string } => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeInMB}MB`
    };
  }
  
  return { valid: true };
};

/**
 * Read file as data URL
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Read file as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

/**
 * Read file as array buffer
 */
export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Convert blob to file
 */
export const blobToFile = (blob: Blob, filename: string): File => {
  return new File([blob], filename, { type: blob.type });
};

/**
 * Download file from URL
 */
export const downloadFile = (url: string, filename?: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Create blob from data
 */
export const createBlob = (data: any, type: string = 'application/json'): Blob => {
  if (type === 'application/json' && typeof data !== 'string') {
    data = JSON.stringify(data, null, 2);
  }
  
  return new Blob([data], { type });
};

/**
 * Get image dimensions
 */
export const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compress image
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> => {
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Get file icon based on type
 */
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️';
  return '📎';
};