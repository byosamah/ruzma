
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export const uploadDeliverableAction = async (
  user: User | null,
  milestoneId: string,
  file: File,
  watermarkText?: string
) => {
  if (!user) {
    toast.error('You must be logged in to upload deliverables');
    return false;
  }

  try {
    console.log('Uploading deliverable for milestone:', milestoneId, 'File:', file.name, 'Size:', file.size);

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
        updated_at: new Date().toISOString(),
        watermark_text: watermarkText || null
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
    
    toast.success('Deliverable uploaded successfully');
    return true;
  } catch (error) {
    console.error('Error uploading deliverable:', error);
    toast.error('Failed to upload deliverable');
    return false;
  }
};
