
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export const updateMilestoneWatermarkAction = async (
  user: User | null,
  milestoneId: string,
  watermarkText: string
) => {
  if (!user) {
    toast.error('You must be logged in to update watermark');
    return false;
  }
  try {
    const { error } = await supabase
      .from('milestones')
      .update({ watermark_text: watermarkText, updated_at: new Date().toISOString() })
      .eq('id', milestoneId);
    if (error) {
      toast.error('Failed to update watermark');
      return false;
    }
    toast.success('Watermark updated');
    return true;
  } catch (e) {
    toast.error('Update failed');
    return false;
  }
};
