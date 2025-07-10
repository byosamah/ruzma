
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { DatabaseProject } from '@/hooks/projectTypes';
import { toast } from 'sonner';

export const updateMilestoneStatusAction = async (
  user: User | null,
  projects: DatabaseProject[],
  milestoneId: string,
  newStatus: string
): Promise<boolean> => {
  if (!user) {
    console.error('User not authenticated');
    return false;
  }

  try {
    console.log(`Updating milestone ${milestoneId} status to ${newStatus}`);

    const { error } = await supabase
      .from('milestones')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId);

    if (error) {
      console.error('Error updating milestone status:', error);
      toast.error('Failed to update milestone status');
      return false;
    }

    console.log('Milestone status updated successfully');
    toast.success('Milestone status updated successfully');
    return true;

  } catch (error) {
    console.error('Unexpected error updating milestone status:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
};
