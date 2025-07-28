import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export const updateMilestoneStatusGeneral = async (
  user: User | null,
  milestoneId: string,
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected'
) => {
  if (!user) {
    toast.error('You must be logged in to update milestone status');
    return false;
  }

  try {
    console.log('Updating milestone status:', milestoneId, 'to', status);

    // First verify the user owns this milestone
    const { data: milestone, error: fetchError } = await supabase
      .from('milestones')
      .select(`
        *,
        projects!inner (
          user_id
        )
      `)
      .eq('id', milestoneId)
      .single();

    if (fetchError || !milestone) {
      console.error('Error fetching milestone:', fetchError);
      toast.error('Failed to fetch milestone details');
      return false;
    }

    // Verify user owns this project
    if (milestone.projects.user_id !== user.id) {
      toast.error('You do not have permission to update this milestone');
      return false;
    }

    // Update the milestone status
    const { error: updateError } = await supabase
      .from('milestones')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId);

    if (updateError) {
      console.error('Error updating milestone status:', updateError);
      toast.error('Failed to update milestone status');
      return false;
    }

    console.log('Milestone status updated successfully');
    toast.success('Status updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating milestone status:', error);
    toast.error('Failed to update milestone status');
    return false;
  }
};