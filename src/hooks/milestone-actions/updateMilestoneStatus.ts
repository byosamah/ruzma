
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject } from '../projectTypes';

export async function updateMilestoneStatusAction(
  milestoneId: string, 
  newStatus: string
): Promise<boolean> {
  try {
    console.log('Updating milestone status:', { milestoneId, newStatus });

    const { error } = await supabase
      .from('milestones')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId);

    if (error) {
      console.error('Error updating milestone status:', error);
      return false;
    }

    console.log('Milestone status updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating milestone status:', error);
    return false;
  }
}
