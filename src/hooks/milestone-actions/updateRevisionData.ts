import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export const updateRevisionDataAction = async (
  user: User | null,
  milestoneId: string,
  newDeliverableLink: string
) => {
  if (!user) {
    toast.error('You must be logged in to update revision data');
    return false;
  }

  try {
    console.log('Updating revision data for milestone:', milestoneId);

    const { error: updateError } = await supabase
      .from('milestones')
      .update({
        deliverable_link: newDeliverableLink,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId);

    if (updateError) {
      console.error('Error updating milestone with revision data:', updateError);
      toast.error('Failed to update revision settings');
      return false;
    }

    console.log('Revision data updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating revision data:', error);
    toast.error('Failed to update revision settings');
    return false;
  }
};

export const addRevisionRequestAction = async (
  user: User | null,
  milestoneId: string,
  newDeliverableLink: string
) => {
  if (!user) {
    toast.error('You must be logged in to request revisions');
    return false;
  }

  try {
    console.log('Adding revision request for milestone:', milestoneId);

    const { error: updateError } = await supabase
      .from('milestones')
      .update({
        deliverable_link: newDeliverableLink,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId);

    if (updateError) {
      console.error('Error adding revision request:', updateError);
      toast.error('Failed to submit revision request');
      return false;
    }

    console.log('Revision request added successfully');
    return true;
  } catch (error) {
    console.error('Error adding revision request:', error);
    toast.error('Failed to submit revision request');
    return false;
  }
};