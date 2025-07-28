
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useProjects } from './useProjects';
import { DatabaseProject } from './projectTypes';
import { useDashboard } from './useDashboard';
import { useUserCurrency } from './useUserCurrency';
import { updateMilestoneStatus as updateMilestoneStatusAction } from './milestone-actions/updateStatus';
import { uploadPaymentProofAction } from './milestone-actions/uploadPaymentProof';
import { updateDeliverableLinkAction } from './milestone-actions/updateDeliverableLink';
import { updateMilestoneStatusGeneral } from './milestone-actions/updateMilestoneStatus';

export const useProjectManagement = (slug: string | undefined) => {
  const { user, profile } = useDashboard();
  const { projects, loading, fetchProjects } = useProjects(user);
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const userCurrency = useUserCurrency(profile);

  // Milestone actions - directly implemented here
  const updateMilestoneStatus = async (
    milestoneId: string,
    status: 'approved' | 'rejected'
  ) => {
    const success = await updateMilestoneStatusAction(user, projects, milestoneId, status);
    if (success) {
      await fetchProjects();
    }
  };

  const uploadPaymentProof = async (milestoneId: string, file: File) => {
    const success = await uploadPaymentProofAction(milestoneId, file);
    if (success) {
      await fetchProjects();
    }
  };

  const updateDeliverableLink = async (milestoneId: string, link: string) => {
    const success = await updateDeliverableLinkAction(user, milestoneId, link);
    if (success) {
      await fetchProjects();
    }
  };

  const updateMilestoneStatusGeneric = async (
    milestoneId: string,
    status: 'pending' | 'payment_submitted' | 'approved' | 'rejected'
  ) => {
    const success = await updateMilestoneStatusGeneral(user, milestoneId, status);
    if (success) {
      await fetchProjects();
    }
  };

  useEffect(() => {
    if (projects.length > 0 && slug) {
      const found = projects.find((p) => p.slug === slug);
      if (found) {
        setProject(found);
      }
    }
  }, [projects, slug]);

  return {
    user,
    profile,
    project,
    projects,
    loading,
    fetchProjects,
    userCurrency,
    updateMilestoneStatus,
    uploadPaymentProof,
    updateDeliverableLink,
    updateMilestoneStatusGeneric,
  };
};
