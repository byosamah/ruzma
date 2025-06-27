
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { trackDeliverableUploaded } from '@/lib/analytics';

// Sanitize filename to remove invalid characters for Supabase Storage
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid characters with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .substring(0, 100); // Limit length
};

export const uploadDeliverableAction = async (
  user: User | null,
  milestoneId: string,
  file: File
) => {
  if (!user) {
    toast.error('You must be logged in to upload deliverables');
    return false;
  }

  try {
    console.log('Starting deliverable upload for milestone:', milestoneId);

    // Check storage limits before uploading
    const { data: limitCheck, error: limitError } = await supabase
      .rpc('check_user_limits', {
        _user_id: user.id,
        _action: 'storage',
        _size: file.size
      });

    if (limitError) {
      console.error('Error checking storage limits:', limitError);
      toast.error('Failed to check storage limits');
      return false;
    }

    if (!limitCheck) {
      toast.error('Storage limit reached. Please upgrade your plan or delete some files to free up space.');
      return false;
    }

    // Sanitize the filename to avoid invalid key errors
    const sanitizedFileName = sanitizeFilename(file.name);
    const fileName = `${Date.now()}-${sanitizedFileName}`;
    const filePath = `${user.id}/${milestoneId}/${fileName}`;

    console.log('Sanitized file path:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('deliverables')
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
      toast.error('Failed to upload file');
      return false;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('deliverables')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('milestones')
      .update({
        deliverable_url: publicUrl,
        deliverable_name: file.name, // Keep original filename for display
        deliverable_size: file.size,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId);

    if (updateError) {
      console.error('Error updating milestone with deliverable:', updateError);
      await supabase.storage.from('deliverables').remove([filePath]);
      toast.error('Failed to save deliverable information');
      return false;
    }

    // Get project ID for tracking
    const { data: milestone } = await supabase
      .from('milestones')
      .select('project_id')
      .eq('id', milestoneId)
      .single();

    if (milestone) {
      trackDeliverableUploaded(milestoneId, milestone.project_id, file.size);
    }

    // Update storage usage
    const { error: storageUpdateError } = await supabase
      .rpc('update_user_storage', {
        _user_id: user.id,
        _size_change: file.size
      });

    if (storageUpdateError) {
      console.error('Error updating storage usage:', storageUpdateError);
    }
    
    toast.success('Deliverable uploaded successfully!');
    return true;
  } catch (error) {
    console.error('Error uploading deliverable:', error);
    toast.error('Failed to upload deliverable');
    return false;
  }
};
