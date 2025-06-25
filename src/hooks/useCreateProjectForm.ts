
import { useCreateProjectFormData } from './createProject/useCreateProjectFormData';
import { useCreateProjectSubmission } from './createProject/useCreateProjectSubmission';
import { useProjectCountSync } from './useProjectCountSync';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCreateProjectForm = (templateData?: any) => {
  const { form, addMilestone, removeMilestone, loadFromTemplate } = useCreateProjectFormData(templateData);
  const { handleSubmit: originalHandleSubmit } = useCreateProjectSubmission();
  const { checkAndSyncBeforeCreate } = useProjectCountSync();

  const handleSubmit = useCallback(async (data: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return;
    }

    // Sync project count before attempting to create
    const canProceed = await checkAndSyncBeforeCreate(user.id);
    if (!canProceed) {
      return;
    }

    // Proceed with original submission
    await originalHandleSubmit(data);
  }, [originalHandleSubmit, checkAndSyncBeforeCreate]);

  return {
    form,
    addMilestone,
    removeMilestone,
    loadFromTemplate,
    handleSubmit,
  };
};
