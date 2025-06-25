
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProjectCountSync = () => {
  const syncProjectCount = useCallback(async (userId: string) => {
    try {
      console.log('Syncing project count for user:', userId);
      
      // Get actual project count
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId);

      if (projectsError) {
        console.error('Error fetching projects for sync:', projectsError);
        return false;
      }

      const actualCount = projects?.length || 0;
      console.log('Actual project count:', actualCount);

      // Get current profile count
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('project_count')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile for sync:', profileError);
        return false;
      }

      const profileCount = profile.project_count || 0;
      console.log('Profile project count:', profileCount);

      // Update if there's a mismatch
      if (actualCount !== profileCount) {
        console.log(`Syncing project count: ${profileCount} -> ${actualCount}`);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            project_count: actualCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating project count:', updateError);
          return false;
        }

        console.log('Project count synced successfully');
        return true;
      }

      console.log('Project count is already in sync');
      return true;
    } catch (error) {
      console.error('Error in syncProjectCount:', error);
      return false;
    }
  }, []);

  const checkAndSyncBeforeCreate = useCallback(async (userId: string) => {
    const synced = await syncProjectCount(userId);
    if (!synced) {
      toast.error('Failed to verify project count. Please try again.');
      return false;
    }
    return true;
  }, [syncProjectCount]);

  return {
    syncProjectCount,
    checkAndSyncBeforeCreate,
  };
};
