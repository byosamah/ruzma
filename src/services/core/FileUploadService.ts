import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ErrorHandler } from './ErrorHandler';
import { logSecurityEvent } from '@/lib/utils/securityLogger';

export interface UploadOptions {
  bucket: string;
  path: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
  onProgress?: (progress: number) => void;
  sanitizeFilename?: boolean;
  checkStorageLimits?: boolean;
  updateStorageUsage?: boolean;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
  fileSize?: number;
}

export class FileUploadService {
  private static instance: FileUploadService;
  
  private constructor() {}

  static getInstance(): FileUploadService {
    if (!this.instance) {
      this.instance = new FileUploadService();
    }
    return this.instance;
  }

  async upload(
    file: File,
    userId: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Check storage limits if requested
      if (options.checkStorageLimits) {
        const canUpload = await this.checkStorageLimits(userId, file.size);
        if (!canUpload) {
          return { 
            success: false, 
            error: 'Storage limit exceeded. Please upgrade your plan.' 
          };
        }
      }

      // Sanitize filename
      const fileName = options.sanitizeFilename 
        ? this.sanitizeFilename(file.name)
        : file.name;

      // Build full path
      const fullPath = `${options.path}/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(fullPath);

      // Update storage usage if requested
      if (options.updateStorageUsage) {
        await this.updateStorageUsage(userId, file.size);
      }

      // Log successful upload
      logSecurityEvent('file_uploaded', {
        userId,
        bucket: options.bucket,
        fileSize: file.size,
        fileType: file.type
      });

      return {
        success: true,
        url: publicUrl,
        path: fullPath,
        fileSize: file.size
      };

    } catch (error) {
      ErrorHandler.handle(error, 'FileUploadService.upload');
      return {
        success: false,
        error: ErrorHandler.getUserMessage(error)
      };
    }
  }

  async delete(
    bucket: string,
    path: string,
    userId?: string,
    updateStorage?: boolean
  ): Promise<boolean> {
    try {
      // Get file size before deletion if we need to update storage
      let fileSize = 0;
      if (updateStorage && userId) {
        const { data } = await supabase.storage
          .from(bucket)
          .list(path.split('/').slice(0, -1).join('/'), {
            search: path.split('/').pop()
          });
        
        if (data && data.length > 0) {
          fileSize = data[0].metadata?.size || 0;
        }
      }

      // Delete file
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw error;
      }

      // Update storage usage
      if (updateStorage && userId && fileSize > 0) {
        await this.updateStorageUsage(userId, -fileSize);
      }

      return true;
    } catch (error) {
      ErrorHandler.handle(error, 'FileUploadService.delete');
      return false;
    }
  }

  private validateFile(
    file: File,
    options: UploadOptions
  ): { isValid: boolean; error?: string } {
    // Check file type
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      const fileType = file.type.toLowerCase();
      const isAllowed = options.allowedTypes.some(type => {
        if (type.includes('*')) {
          const [category] = type.split('/');
          return fileType.startsWith(category);
        }
        return fileType === type;
      });

      if (!isAllowed) {
        return {
          isValid: false,
          error: `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`
        };
      }
    }

    // Check file size
    if (options.maxSizeMB) {
      const maxSizeBytes = options.maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return {
          isValid: false,
          error: `File size exceeds ${options.maxSizeMB}MB limit`
        };
      }
    }

    return { isValid: true };
  }

  private async checkStorageLimits(
    userId: string,
    fileSize: number
  ): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, storage_used')
        .eq('id', userId)
        .single();

      if (!profile) {
        return true; // Allow if we can't check
      }

      const { data: limits } = await supabase
        .from('user_plan_limits')
        .select('storage_limit_bytes')
        .eq('user_type', profile.user_type || 'free')
        .single();

      if (!limits) {
        return true; // Allow if we can't check
      }

      const newUsage = (profile.storage_used || 0) + fileSize;
      return newUsage <= limits.storage_limit_bytes;

    } catch (error) {
      console.error('Error checking storage limits:', error);
      return true; // Allow upload if check fails
    }
  }

  private async updateStorageUsage(
    userId: string,
    sizeChange: number
  ): Promise<void> {
    try {
      const { data: current } = await supabase
        .from('profiles')
        .select('storage_used')
        .eq('id', userId)
        .single();

      if (current) {
        const newUsage = Math.max(0, (current.storage_used || 0) + sizeChange);
        
        await supabase
          .from('profiles')
          .update({ storage_used: newUsage })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Error updating storage usage:', error);
      // Don't throw - this is not critical
    }
  }

  private sanitizeFilename(filename: string): string {
    // Get file extension
    const ext = filename.split('.').pop() || '';
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    
    // Sanitize the name part
    const sanitized = nameWithoutExt
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 100); // Limit length
    
    // Add timestamp for uniqueness
    const timestamp = Date.now();
    
    return ext ? `${sanitized}-${timestamp}.${ext}` : `${sanitized}-${timestamp}`;
  }

  // Utility method to get file from URL
  async getFileFromUrl(url: string): Promise<File | null> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const filename = url.split('/').pop() || 'file';
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      ErrorHandler.handle(error, 'FileUploadService.getFileFromUrl');
      return null;
    }
  }

  // Batch upload support
  async uploadBatch(
    files: File[],
    userId: string,
    options: UploadOptions,
    onProgress?: (completed: number, total: number) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    let completed = 0;

    for (const file of files) {
      const result = await this.upload(file, userId, {
        ...options,
        path: `${options.path}/${Date.now()}`
      });
      
      results.push(result);
      completed++;
      
      if (onProgress) {
        onProgress(completed, files.length);
      }
    }

    return results;
  }
}

// Export singleton instance
export const fileUploadService = FileUploadService.getInstance();