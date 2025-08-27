import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { ProjectTemplate } from '@/types/projectTemplate';
import { DatabaseProject } from '@/hooks/projectTypes';
import { useProjectForm } from '@/hooks/projects/useProjectForm';
import { useProjectMilestones } from '@/hooks/projects/useProjectMilestones';
import { useProjectSubmission } from '@/hooks/projects/useProjectSubmission';

export interface UseProjectManagerOptions {
  mode: 'create' | 'edit';
  user: User | null;
  projectId?: string;
  templateData?: ProjectTemplate;
  existingProject?: DatabaseProject;
}

export const useProjectManager = (options: UseProjectManagerOptions) => {
  const { mode, user, templateData, existingProject } = options;
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Use the smaller, focused hooks
  const formHook = useProjectForm({ 
    mode, 
    templateData, 
    existingProject 
  });
  
  const milestonesHook = useProjectMilestones({ user });
  
  const submissionHook = useProjectSubmission({ 
    mode, 
    user, 
    existingProject, 
    saveAsTemplate, 
    setSaveAsTemplate 
  });

  return {
    // Form management
    form: formHook.form,
    addMilestone: formHook.addMilestone,
    removeMilestone: formHook.removeMilestone,
    loadFromTemplate: formHook.loadFromTemplate,
    
    // Submission management
    isSubmitting: submissionHook.isSubmitting,
    handleSubmit: formHook.form.handleSubmit(submissionHook.handleSubmit),
    saveTemplate: submissionHook.saveTemplate,
    saveAsTemplate: submissionHook.saveAsTemplate,
    setSaveAsTemplate: submissionHook.setSaveAsTemplate,
    
    // Milestone operations
    updateMilestoneStatus: milestonesHook.updateMilestoneStatus,
    updateMilestoneStatusGeneral: milestonesHook.updateMilestoneStatusGeneral,
    uploadPaymentProof: milestonesHook.uploadPaymentProof,
    uploadDeliverable: milestonesHook.uploadDeliverable,
    downloadDeliverable: milestonesHook.downloadDeliverable,
    updateDeliverableLink: milestonesHook.updateDeliverableLink,
    updateRevisionData: milestonesHook.updateRevisionData,
    addRevisionRequest: milestonesHook.addRevisionRequest,
    addRevisionRequestClient: milestonesHook.addRevisionRequestClient,
    
    // Mode
    mode,
  };
};