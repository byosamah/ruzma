
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

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
    console.log('Uploading deliverable for milestone:', milestoneId, 'File:', file.name, 'Size:', file.size);

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

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${user.id}/${milestoneId}/${fileName}`;

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
        deliverable_name: file.name,
        deliverable_size: file.size,
        deliverable_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating milestone with deliverable info:', updateError);
      toast.error('Failed to update milestone in database');
      await supabase.storage.from('deliverables').remove([filePath]);
      return false;
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
    
    toast.success('Deliverable uploaded successfully');
    return true;
  } catch (error) {
    console.error('Error uploading deliverable:', error);
    toast.error('Failed to upload deliverable');
    return false;
  }
};
