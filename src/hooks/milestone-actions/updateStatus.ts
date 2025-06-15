
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export const updateMilestoneStatusAction = async (
  user: User | null,
  milestoneId: string,
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected'
) => {
  if (!user) {
    toast.error('You must be logged in to update milestone status');
    return false;
  }
  try {
    const { error } = await supabase
      .from('milestones')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId);

    if (error) {
      console.error('Error updating milestone status:', error);
      toast.error('Failed to update milestone status');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to update milestone status');
    return false;
  }
};
