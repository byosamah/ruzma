
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { DatabaseProject } from '@/types/shared';
import { sendPaymentNotification } from '@/services/emailNotifications';
import { trackMilestoneApproved } from '@/lib/analytics';

export const updateMilestoneStatus = async (
  user: User | null,
  projects: DatabaseProject[],
  milestoneId: string,
  status: 'approved' | 'rejected'
) => {
  if (!user) {
    toast.error('You must be logged in to update milestone status');
    return false;
  }

  try {
    // First, get the milestone and project details
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select(`
        *,
        projects!inner (
          id,
          name,
          client_email,
          client_access_token,
          user_id
        )
      `)
      .eq('id', milestoneId)
      .single();

    if (milestoneError || !milestone) {
      console.error('Error fetching milestone:', milestoneError);
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

    // Track milestone approval
    if (status === 'approved') {
      trackMilestoneApproved(milestoneId, milestone.projects.id, milestone.price);
    }

    // Send email notification if client email exists
    if (milestone.projects.client_email) {
      try {
        await sendPaymentNotification({
          clientEmail: milestone.projects.client_email,
          projectName: milestone.projects.name,
          projectId: milestone.projects.id,
          clientToken: milestone.projects.client_access_token,
          isApproved: status === 'approved',
          milestoneName: milestone.title,
        });
        
        console.log('Email notification sent successfully');
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the status update if email fails
        toast.error('Status updated but failed to send email notification');
      }
    }

    const statusText = status === 'approved' ? 'approved' : 'rejected';
    toast.success(`Payment proof ${statusText} successfully`);
    return true;
  } catch (error) {
    console.error('Error updating milestone status:', error);
    toast.error('Failed to update milestone status');
    return false;
  }
};
