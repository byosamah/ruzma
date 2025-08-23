
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProjectCountSync = () => {
  const syncProjectCount = useCallback(async (userId: string) => {
    try {
      // Get actual project count
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId);

      if (projectsError) {
        toast.error('Failed to fetch projects for sync');
        return false;
      }

      const actualCount = projects?.length || 0;

      // Get current profile count
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('project_count')
        .eq('id', userId)
        .single();

      if (profileError) {
        toast.error('Failed to fetch profile for sync');
        return false;
      }

      const profileCount = profile.project_count || 0;

      // Update if there's a mismatch
      if (actualCount !== profileCount) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            project_count: actualCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          toast.error('Failed to update project count');
          return false;
        }

        return true;
      }

      return true;
    } catch (error) {
      toast.error('Failed to sync project count');
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
