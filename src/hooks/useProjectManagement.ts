
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useProjects } from './useProjects';
import { useMilestoneActions } from './useMilestoneActions';
import { DatabaseProject } from './projectTypes';
import { useDashboard } from './useDashboard';
import { useUserCurrency } from './useUserCurrency';

export const useProjectManagement = (slug: string | undefined) => {
  const { user, profile } = useDashboard();
  const { projects, loading, fetchProjects } = useProjects(user);
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const userCurrency = useUserCurrency(profile);

  const {
    updateMilestoneStatus,
    updateStatus,
    uploadPaymentProof,
    uploadDeliverable,
    updateDeliverableLink,
    downloadDeliverable,
  } = useMilestoneActions(user, projects, fetchProjects);

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
    updateStatus,
    uploadPaymentProof,
    uploadDeliverable,
    updateDeliverableLink,
    downloadDeliverable,
  };
};
