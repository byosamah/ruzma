
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export const updateDeliverableLinkAction = async (
  user: User | null,
  milestoneId: string,
  link: string
) => {
  if (!user) {
    toast.error('You must be logged in to update deliverable links');
    return false;
  }

  try {
    console.log('Updating deliverable link for milestone:', milestoneId);

    const { error: updateError } = await supabase
      .from('milestones')
      .update({
        deliverable_link: link || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId);

    if (updateError) {
      console.error('Error updating milestone with deliverable link:', updateError);
      toast.error('Failed to update deliverable link');
      return false;
    }

    console.log('Deliverable link updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating deliverable link:', error);
    toast.error('Failed to update deliverable link');
    return false;
  }
};
